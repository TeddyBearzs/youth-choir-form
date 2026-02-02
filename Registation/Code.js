/**
 * Redirect GET requests to the API handler (for searching)
 */
function doGet(e) {
  if (e.parameter.action === "search") {
    return handleSearch(e.parameter.date, e.parameter.name);
  }
  return ContentService.createTextOutput("API is running.").setMimeType(
    ContentService.MimeType.TEXT,
  );
}

/**
 * Handles POST requests (for Add and Update) from GitHub Pages
 */
function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const action = params.action;

    if (action === "add") {
      return handleAdd(params);
    } else if (action === "update") {
      return handleUpdate(params);
    }
  } catch (error) {
    return createResponse({ success: false, message: error.toString() });
  }
}

/**
 * Saves a new record into separate First and Last name columns
 */
function handleAdd(formData) {
  const sheet = getAttendanceSheet();

  // Appends to: Date (A), First Name (B), Last Name (C), Status (D), Reason (E), Timestamp (F)
  sheet.appendRow([
    formData.date,
    formData.firstName,
    formData.lastName,
    formData.status,
    formData.reason || "N/A",
    new Date(),
  ]);

  return createResponse({ success: true, message: "New attendance recorded!" });
}

/**
 * Searches for a record by looking at Column B (First) and Column C (Last) combined
 */
function handleSearch(searchDate, searchName) {
  const sheet = getAttendanceSheet();
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    let rowDate = Utilities.formatDate(
      new Date(data[i][0]),
      Session.getScriptTimeZone(),
      "yyyy-MM-dd",
    );
    let firstName = data[i][1].toString();
    let lastName = data[i][2].toString();
    let fullNameFromSheet = (firstName + " " + lastName).toLowerCase().trim();

    if (
      rowDate === searchDate &&
      fullNameFromSheet === searchName.toLowerCase().trim()
    ) {
      return createResponse({
        success: true,
        row: i + 1,
        data: {
          date: rowDate,
          firstName: firstName,
          lastName: lastName,
          status: data[i][3],
          reason: data[i][4],
        },
      });
    }
  }
  return createResponse({ success: false, message: "No record found." });
}

/**
 * Updates an existing row across the separate columns
 */
function handleUpdate(formData) {
  const sheet = getAttendanceSheet();
  const row = parseInt(formData.rowId);

  // Update Range: Columns A through E (1 to 5)
  sheet
    .getRange(row, 1, 1, 5)
    .setValues([
      [
        formData.date,
        formData.firstName,
        formData.lastName,
        formData.status,
        formData.reason || "N/A",
      ],
    ]);

  return createResponse({ success: true, message: "Record updated!" });
}

function getAttendanceSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Attendance");
  if (!sheet) throw new Error('Sheet "Attendance" not found.');
  return sheet;
}

function createResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
