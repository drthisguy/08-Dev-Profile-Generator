const inquirer = require("inquirer"),
      fs = require("fs"),
      axios = require("axios")
      pdf = require('html-pdf'),
      inlineCss = require('inline-css');

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
    choices: ["Red", separator,"blue", separator, "Green", separator, "Yellow", separator, "Pink", separator, "Purple"]
    }
  ]);
}


async function getGit(answers) {
  let html;
  const clientId = '585e16451351f4642f7b',
        clientSecret = 'd2d84e9c5dcc60fee78d17922ef0c3024a7ba996',
        queryUrl = `https://api.github.com/users/${answers.username}?client_id=${clientId}&client_secret=${clientSecret}`,
        color = answers.color.toLowerCase();
     
        
  try {
  await axios.get(queryUrl).then( profile => {
 
  html = generateHTML(profile.data, color);
})
  await inlineCss(html, {url:' '})
  .then( html =>  {
  
  pdf.create(html).toFile('developer.pdf', (err, res) => {
    if (err) {
      return console.log(err);
    }
    console.log(res, 'Complete!');
  });

});} catch (err) {
console.log(err);
}
}

promptUser()
  .then((response) => {
   getGit(response);
})
 .catch((err) => {
   console.log(err);
 })


function generateHTML(profile, color) {
  console.log(profile.login);
  
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>Developer Profile</title>
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
        <link rel="stylesheet" href="https://raw.githubusercontent.com/drthisguy/Homework-8/master/assets/css/style.css">
    </head>
    <body>
        <nav class="navbar navbar-expand-lg ${color}-back">
            <h3 class="navbar-brand p-3">${profile.login}</h3>
          </nav>

          <div class="container">
    
            <div class="card m-5">
                <h2 class="card-header ${color}-back p-2">${profile.name}</h2>
                <div class="card-body">
                  <h5 class="card-title">${profile.company}</h5>
                 <h6 class="card-subtitle text-muted">Email: ${profile.email}
                </div>
                <div class="row"> 
                    <div class="col">
                <img src="${profile.avatar_url}">
            </div> 
            <div class="col bio">${profile.bio}</div>
            <div class="card-body">
            <p class="card-text">${profile.location}.</p>
          </div>
        </div>
                <ul class="list-group list-group-flush ${color}">
                  <li class="list-group-item">GitHub Profile: <p id="right">${profile.html_url}</p></li>
                  <li class="list-group-item">Blog: <p id="right">${profile.blog}</p></li>
                  <li class="list-group-item">Public Repos: <p id="right">${profile.public_repos}</p></li>
                  <li class="list-group-item">Stars: <p id="right"> stars </p></li>
                  <li class="list-group-item">Followers: <p id="right">${profile.followers}</p></li>
                  <li class="list-group-item">Following: <p id="right">${profile.following}</p></li>
                </ul>
              
                <div class="card-footer">
                <p>Links: </p>
                  <a href="${profile.html_url}" class="card-link">Profile </a>
                  <a href="${profile.blog}" class="card-link">Blog</a>
                  <a href="http://maps.google.com/?q=${profile.location}
                  "class="card-link">Location link</a>
                </div>
              </div>
          </div>

          <footer>
          <p class="${color}-back">Developer Profile <br>&copy; Copyright</p>
      </footer>

  </body>
  </html>`;
  }
