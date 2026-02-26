/**
 * Updated Apps Script Backend for External Requests (GitHub/HTML)
 * Updated with spiritual background and ministry fields
 */

function doPost(e) {
  try {
    const formData = JSON.parse(e.postData.contents);
    const result = processForm(formData);
    
    return ContentService.createTextOutput(JSON.stringify({ "result": result }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ "result": "Error: " + err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

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
  
  // Prepare the record based on form fields
  const record = [
    formData.id || Utilities.getUuid(),
    formData.firstName,
    formData.lastName,
    formData.gender,
    formData.church,
    formData.pastorName,
    formData.youthLeader,
    formData.phone,
    formData.ailments,
    formData.contactType + ": " + formData.contactName,
    formData.contactPhone,
    formData.salvationDate,
    formData.baptismStatus === "Baptized" ? formData.baptismDate : "Not baptized as yet",
    formData.holyGhostBaptism,
    formData.ministryAreas // This will be a comma-separated string from the JS
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
        // Create clean keys for the JSON response
        const key = header.toString().replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        obj[key] = data[i][index];
      });
      results.push(obj);
    }
  }
  return results;
}
