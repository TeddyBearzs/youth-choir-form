/**
 * Google Apps Script for Registration Form
 * Handles page serving and data submission/retrieval
 */

function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('Registration & Update Portal')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Saves or Updates a registration entry
 */
function processForm(formData) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Registrations');
  const data = sheet.getDataRange().getValues();
  
  const record = [
    formData.id || Utilities.getUuid(), // Create unique ID if new
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
    // UPDATE MODE: Find row by ID
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] == formData.id) {
        sheet.getRange(i + 1, 1, 1, record.length).setValues([record]);
        return "Entry updated successfully!";
      }
    }
  } 
  
  // CREATE MODE: Append new row
  sheet.appendRow(record);
  return "Registration saved successfully!";
}

/**
 * Search for records by name
 */
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