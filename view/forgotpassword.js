function forgotpassword(e) {
    e.preventDefault();
    console.log(e.target.name);
    const form = new FormData(e.target);

    const userDetails = {
        email: form.get("email"),

    }
    console.log(userDetails)
    axios.post('http://localhost:3000/password/forgotpassword', userDetails)
    .then(response => {
      if (response.data.success) {
        document.body.innerHTML += '<div style="color:green;">Mail Successfully sent <div>';
      } else {
        document.body.innerHTML += `<div style="color:red;">${response.data.message || 'Something went wrong! Please try again later.'} <div>`;
      }
    })
    .catch(err => {
      console.error(err);
      document.body.innerHTML += `<div style="color:red;">Something went wrong! Please try again later. <div>`;
    });
  
}