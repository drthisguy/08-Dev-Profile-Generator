const inquirer = require("inquirer"),
      fs = require("fs"),
      axios = require("axios")
      pdf = require('html-pdf');

const { promisify } = require('util'),
      writeHTML = promisify(fs.writeFile);

function promptUser() {
  const separator = new inquirer.Separator();  
  return inquirer.prompt([
    {
    type: "input",
    name: "username",
    message: "What is your GitHub username?"
    },
    {
    type: "list",
    name: "color",
    message: "Which is your favorite color?",
    choices: ["Grey", separator, "Red", separator,"blue", separator, "Green", separator, "Purple"]
    }
  ]);
}

function generateHTML(profile) {
  console.log(profile.login);
  
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>Developer Profile</title>
        <link rel="stylesheet" href="assets/css/bootstrap.min.css">
        <link rel="stylesheet" href="assets/css/style.css">
    </head>
    <body>
    
        <nav class="navbar navbar-expand-lg navbar-light bg-light" id= "pageHeader">
            <a class="navbar-brand" href="#">${profile.login}</a>
              
          </nav>

          <div class="container">
    
            <div class="card m-5">
                <h3 class="card-header">${profile.name}</h3>
                <div class="card-body">
                  <h5 class="card-title">${profile.company}</h5>
                 <h6 class="card-subtitle text-muted">Email: </h6><p>${profile.email}</p>
                </div>
                <div class="row"> 
                    <div class="col">
                <img style="height: 300px; width: 100%; display: block;" src="${profile.avatar_url}">
                <div class="card-body">
                  <p class="card-text">${profile.location}.</p>
                </div>
            </div> 
            <div class="col">${profile.bio}</div>
        </div>
                <ul class="list-group list-group-flush">
                  <li class="list-group-item">GitHub Profile: ${profile.html_url}</li>
                  <li class="list-group-item">Blog: ${profile.blog}</li>
                  <li class="list-group-item">Public Repos: ${profile.public_repos}</li>
                  <li class="list-group-item">Stars: </li>
                  <li class="list-group-item">Followers: ${profile.followers}</li>
                  <li class="list-group-item">Following: ${profile.following}</li>
                </ul>
              
                <div class="card-footer text-muted">
                  <a href="${profile.html_url}" class="card-link">Profile link</a>
                  <a href="${profile.blog}" class="card-link">Blog link</a>
                  <a href="http://maps.google.com/?q=${profile.location}
                  "class="card-link">Location link</a>
                </div>
              </div>
          </div>
    </body>
    </html>`;
  }

async function getGit(username) {
  try {
    const clientId = '585e16451351f4642f7b',
    clientSecret = 'd2d84e9c5dcc60fee78d17922ef0c3024a7ba996',
    queryUrl = `https://api.github.com/users/${username}?client_id=${clientId}&client_secret=${clientSecret}`;
    let html;
    await axios.get(queryUrl).then((profile) => {
   
    html = generateHTML(profile.data);
})
    const options = { base : "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"}
    await pdf.create(html, options).toFile('developer.pdf', (err, res) => {
      if (err) {
        return console.log(err);
      }
      console.log(res, 'Complete!');
    });

} catch (err) {
  console.log(err);
}
}

promptUser()
    .then((response) => {
     getGit(response.username);
  })
   .catch((err) => {
     console.log(err);
   })
