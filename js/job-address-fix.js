// M4 Job Address Fix
// If job_address is blank on save, auto-fill from client address
// Additive only
(function(){
try {

var _origSaveJob = window.saveJob;
window.saveJob = function() {
  // Before saving, check if address is blank and fill from client
  var addrField = document.getElementById('job_address');
  var clientField = document.getElementById('client_id');
  if (addrField && clientField && (!addrField.value || !addrField.value.trim())) {
    var clientId = clientField.value;
    if (clientId) {
      var client = clients.find(function(c) { return c.id === clientId; });
      if (client && client.address && client.address.trim()) {
        addrField.value = client.address.trim();
      }
    }
  }
  return _origSaveJob();
};

// Also fix updateJob
var _origUpdateJob = window.updateJob;
if (_origUpdateJob) {
  window.updateJob = function(id) {
    var addrField = document.getElementById('job_address');
    var clientField = document.getElementById('client_id');
    if (addrField && clientField && (!addrField.value || !addrField.value.trim())) {
      var clientId = clientField.value;
      if (clientId) {
        var client = clients.find(function(c) { return c.id === clientId; });
        if (client && client.address && client.address.trim()) {
          addrField.value = client.address.trim();
        }
      }
    }
    return _origUpdateJob(id);
  };
}

console.log('Job address fix loaded');

} catch(e) {
  console.error('Job address fix error:', e);
}
})();
