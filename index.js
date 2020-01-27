const inquirer = require("inquirer"),
      fs = require("fs"),
      axios = require("axios")
      puppeteer = require('puppeteer');

const { promisify } = require('util'),
      writeHTML = promisify(fs.writeFile)

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
    
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <a class="navbar-brand" href="#">${profile.login}</a>
              
          </nav>

          <div class="container">
    
            <div class="card mb-3">
                <h3 class="card-header">${profile.name}</h3>
                <div class="card-body">
                  <h5 class="card-title">${profile.company}</h5>
                 <span> <h6 class="card-subtitle text-muted">Email: </h6><p>${profile.email}</p></span>
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
    const clientId = 'ee1c1f5acf97127d2a3c',
    clientSecret = 'd2d84e9c5dcc60fee78d17922ef0c3024a7ba996',
    queryUrl = `https://api.github.com/users/${username}?client_id=${clientId}&client_secret=${clientSecret}`;
    await axios.get(queryUrl).then((profile) => {
//     fs.writeFile("response.txt", response, function(err) {
//         if (err) {
//             throw err;
//         }
// })
console.log(profile.data);

return profile.data;
  })
}

promptUser()
    .then((response) => {
    const profile = getGit(response.username);
    console.log(profile);
    const html = generateHTML(profile);
    return writeHTML("index1.html", html);
  })
  .then(() => {
      console.log('Success!!');
      
  })
    .catch((err) => {
        console.log(err);
  });