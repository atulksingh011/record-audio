document.getElementById('apiCall').addEventListener('click', () => {
    fetch('/api/data')
      .then(response => {
        if (response.status === 401) {
          window.location.reload();
        } else {
          response.json().then(data => console.log(data));
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  });
  