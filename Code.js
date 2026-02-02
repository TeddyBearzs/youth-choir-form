/**
 * Apps Script Backend for GitHub Pages
 * Handles POST requests for saving/updating and GET for searching
 */

// Allow the script to be called from a different domain (GitHub Pages)
function doPost(e) {
  const result = processForm(JSON.parse(e.postData.contents));
  return ContentService.createTextOutput(JSON.stringify({ "result": result }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Separate function for searching via GET
function doGet(e) {
  if (e.parameter.search) {
    const results = searchRecords(e.parameter.search);
    return ContentService.createTextOutput(JSON.stringify(results))
      .setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService.createTextOutput("Service Running");
}

function processForm(formData) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Registrations');
  if (!sheet) return "Error: Sheet 'Registrations' not found";
  
  const data = sheet.getDataRange().getValues();
  const record = [
    formData.id || Utilities.getUuid(),
    formData.firstName,
    formData.lastName,
    formData.gender,
    formData.church,
    formData.phone,
    formData.ailments,
    formData.contactType + ": " + formData.contactName,
    formData.contactPhone
  ];

  if (formData.id) {
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] == formData.id) {
        sheet.getRange(i + 1, 1, 1, record.length).setValues([record]);
        return "Entry updated successfully!";
      }
    }
  } 
  sheet.appendRow(record);
  return "Registration saved successfully!";
}

function searchRecords(query) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Registrations');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const results = [];
  const searchTerm = query.toLowerCase();

  for (let i = 1; i < data.length; i++) {
    const firstName = String(data[i][1]).toLowerCase();
    const lastName = String(data[i][2]).toLowerCase();
    if (firstName.includes(searchTerm) || lastName.includes(searchTerm)) {
      let obj = {};
      headers.forEach((header, index) => {
        obj[header.replace(/\s+/g, '').toLowerCase()] = data[i][index];
      });
      results.push(obj);
    }
  }
  return results;
}
