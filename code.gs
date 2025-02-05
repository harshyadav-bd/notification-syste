function checkStatusChanges() {
  // Get the spreadsheet and sheets
  const ss = SpreadsheetApp.openById('1CryA1luC75ytT5PX--0PiqbyP-_7Sw3QStgtfhlbS1c');
  const roadmapSheet = ss.getSheetByName('Product Roadmap 2024 Phase 1');
  const emailSheet = ss.getSheetByName('prod-ops-emails');
  
  // Get data ranges
  const dataRange = roadmapSheet.getRange('A4:H' + roadmapSheet.getLastRow());
  const values = dataRange.getValues();
  
  // Get email list
  const emailData = emailSheet.getRange('A2:B' + emailSheet.getLastRow()).getValues();
  const emailList = emailData.map(row => row[1]).filter(email => email !== '');
  
  let changesDetected = [];
  
  // Compare values and track changes
  values.forEach((row, index) => {
    const currentStatus = row[2];  // Column C
    const previousStatus = row[7];  // Column H
    
    // Check all conditions:
    // 1. Previous status (Column H) must have a value
    // 2. Current status must be different from previous status
    // 3. Current status must be "In Testing"
    if (previousStatus && 
        previousStatus !== currentStatus && 
        currentStatus === "In Testing") {
      changesDetected.push({
        row: index + 4,
        details: row.slice(0, 7)  // Columns A to G
      });
    }
    
    // Update Column H with current status
    roadmapSheet.getRange(index + 4, 8).setValue(currentStatus);
  });
  
  // Send notifications if changes were detected
  if (changesDetected.length > 0) {
    sendNotifications(changesDetected, emailList);
  }
}

function sendNotifications(changes, emailList) {
  const subject = 'Project moved to In-testing (State Change Notification)';
  
  let emailBody = `<p>Dear Team,</p>
                   <p>This is a notification to inform you that the following projects have moved to the "In-Testing" state. 
                   Please proceed with creating 1-pager knowledge guide for the specific projects.</p>`;

  changes.forEach(change => {
    emailBody += `<p><strong><u>${change.details[0]}</u></strong></p>`;
    emailBody += `<p>- Category: ${change.details[1]}</p>`;
    emailBody += `<p>- Current State: ${change.details[2]}</p>`;
    emailBody += `<p>- Commit Quarter: ${change.details[3]}</p>`;
    emailBody += `<p>- Start Date: ${change.details[4]}</p>`;
    emailBody += `<p>- End Date: ${change.details[5]}</p>`;
    emailBody += `<p>- Product Manager: ${change.details[6]}</p><br>`;
  });
  
  MailApp.sendEmail({
    bcc: emailList.join(','),
    subject: subject,
    htmlBody: emailBody
  });
}
