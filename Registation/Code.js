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
 * Saves a new record using separate first and last names
 */
function handleAdd(formData) {
  const sheet = getAttendanceSheet();
  const fullName = `${formData.firstName} ${formData.lastName}`.trim();

  sheet.appendRow([
    formData.date,
    fullName,
    formData.status,
    formData.reason || "N/A",
    new Date(),
  ]);

  return createResponse({ success: true, message: "New attendance recorded!" });
}

/**
 * Searches for a record and returns separate first and last names
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
    if (
      rowDate === searchDate &&
      data[i][1].toString().toLowerCase() === searchName.toLowerCase()
    ) {
      // Split the Full Name from the sheet into First and Last for the API response
      const nameParts = data[i][1].toString().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      return createResponse({
        success: true,
        row: i + 1,
        data: {
          date: rowDate,
          firstName: firstName,
          lastName: lastName,
          status: data[i][2],
          reason: data[i][3],
        },
      });
    }
  }
  return createResponse({ success: false, message: "No record found." });
}

/**
 * Updates an existing row using separate first and last names
 */
function handleUpdate(formData) {
  const sheet = getAttendanceSheet();
  const fullName = `${formData.firstName} ${formData.lastName}`.trim();

  sheet
    .getRange(parseInt(formData.rowId), 1, 1, 4)
    .setValues([
      [formData.date, fullName, formData.status, formData.reason || "N/A"],
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
