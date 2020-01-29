const inquirer = require("inquirer"),
      fs = require("fs"),
      axios = require("axios")
      pdf = require('html-pdf'),
      inlineCss = require('inline-css');

function promptUser() {
  const separator = new inquirer.Separator(),
        ending = new inquirer.Separator('******END******');
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
    choices: ["Red", separator,"blue", separator, "Green", separator, "Yellow", separator, "Pink", separator, "Purple", ending]
    }
  ]);
}

async function getGit(answers) {
  let html;
  const clientId = '585e16451351f4642f7b',
        clientSecret = '0d1a343a86da70defdf0bd97641c990967b08cd0',
        queryUrl = `https://api.github.com/users/${answers.username}?client_id=${clientId}&client_secret=${clientSecret}`,
        config = {headers: {'Authorization': `token ${clientSecret}`}}, //needed for some of the response data like emails, etc.
        color = answers.color.toLowerCase();     
        
  try {
   html = await axios.get(queryUrl, config).then( profile => generateHTML(profile.data, color))

   await inlineCss(html, {url:' '}).then( html =>  {

  pdf.create(html).toFile('developer.pdf', (err, res) => {
    if (err) {
      return console.log(err);
    }
    const { filename } = res;
    console.log(`Writing output file to:\n`, filename, `\n\nSuccess!`);
  })
})
  } catch (err) {
  console.log(err);
  }
}

promptUser().then( response => {
   getGit(response);
})
 .catch((err) => {
   console.log(err);
 })

function generateHTML(profile, color) {
  console.log('Generating profile pdf...');
  console.log(profile.email);
  
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>Developer Profile</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootswatch/4.4.1/lux/bootstrap.min.css">
        <link rel="stylesheet" href="https://raw.githubusercontent.com/drthisguy/Homework-8/master/assets/css/style.css">
    </head>
    <body>
        <nav class="navbar ${color}-back">
            <h3 class="user">${profile.login}</h3>
          </nav>

            <div class="card mt-3">
                <h2 class="card-header ${color}-back">${profile.name}</h2>
                <div class="card-body">
                  <h5 class="card-title">${profile.company}</h5>
                 <h6 class="card-subtitle text-muted">Email: ${profile.email}
                </div>
                
                 <div class="row">
                <div class="col"><img src=${profile.avatar_url}"><div class="col">
                <p class="bio"> ${profile.bio}</p></div></div>
            <div class="card-body">
            <br><br>
            <hr id="${color}">
            <p class="locale">${profile.location}.</p>
          </div>
          <br>
                <ul class="list-group list-group-flush ${color}">
                  <li class="list-group-item">GitHub Profile: <p id="right">${profile.html_url}</p></li>
                  <li class="list-group-item">Blog: <p id="right">${profile.blog}</p></li>
                  <li class="list-group-item">Public Repos: <p id="right">${profile.public_repos}</p></li>
                  <li class="list-group-item">Stars: <p id="right"> stars </p></li>
                  <li class="list-group-item">Followers: <p id="right">${profile.followers}</p></li>
                  <li class="list-group-item">Following: <p id="right">${profile.following}</p></li>
                </ul>
              
                <p class="ml-4">Links:</p>
                <div class="card-footer">
                  <a href="${profile.html_url}" target="_blank" class="card-link ${color}">Profile </a>
                  <a href="mailto:${profile.email}" class="card-link ${color}">Profile </a>
                  <a href="${profile.blog}" target="_blank" class="card-link ${color}">Blog</a>
                  <a href="http://maps.google.com/?q=${profile.location}
                  " target="_blank" class="card-link ${color}">Location link</a>
                </div>
              </div>
          
          <br>
          <footer class="${color}-back">
          <p>Developer Profile <br>&copy; Copyright</p>
      </footer>

  </body>
  </html>`;
  }
