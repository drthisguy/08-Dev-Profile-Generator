const inquirer = require("inquirer"),
  path = require("path"),
  open = require("open"),
  axios = require("axios"),
  pdf = require("html-pdf"),
  inlineCss = require("inline-css"),
  cliProgress = require("cli-progress");

// prompt users: 
(() => {
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
  ])
})().then( answers => getGit(answers))
.catch( err => console.log(err)) 

// Get profile
async function getGit(answers) {
  let html;
  const queryUrl = `https://api.github.com/users/${answers.username}?`,
        color = answers.color.toLowerCase(),
        stars = await getStars(answers.username);

  try {
  html = await axios
    .get(queryUrl)
    .then(profile => generateHTML(profile.data, color, stars));

  await inlineCss(html, { url: " " }).then(html => {
    pdf.create(html).toFile(`${answers.username}.pdf`, (err, res) => {
      if (err) {
        return console.error(err);
      }

      const { filename } = res;
      console.log(`Writing output file to:\n`, filename, `\n\nSuccess!`);
      console.log(`Opening ${answers.username}.pdf...`);
      open(path.join(process.cwd(), `${answers.username}.pdf`));
    });
  });
} catch (err) {
  console.log(err);
}

}

// Get repo stars
function getStars(userName) {
  return new Promise((resolve, reject) => {
    const queryUrl = `https://api.github.com/users/${userName}/repos?`;
    let starz;

    axios.get(queryUrl).then(({data}) => {
      const stars = [];
       data.forEach(repo => {
        stars.push(repo.stargazers_count);
      });
      starz = stars.reduce((a, b) => a + b, 0); 

      if (starz !== starz) {
        return reject(Error("Something strange went down!"));
      }
      resolve(starz);
    });
  });
}

// run progress bar
function progBar() {
  const bar = new cliProgress.SingleBar(
    {
      format: "progress [{bar}] {percentage}%",
      stopOnComplete: true,
      clearOnComplete: false,
      hideCursor: true
    },
    cliProgress.Presets.shades_classic
  );

  bar.start(80, 0);

  (() => {
    const timer = setInterval(() => {
      bar.increment();
      if (!bar.isActive) {
        clearInterval(timer);
        bar.stop();
      }
    }, 20);
  })();
}

function generateHTML(profile, color, stars) {
  console.log('Generating profile pdf...');
  progBar();
  
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

  <body d-flex flex-column>
      <nav class="navbar ${color}-back">
          <h3 class="user">${profile.login}</h3>
      </nav>

      <div class="card mt-3">
          <h2 class="card-header ${color}-back">${profile.name}</h2>
          <div class="card-body">
              <h5 class="card-title">${profile.company}</h5>
              <h6 class="card-subtitle text-muted">Email: Deprecated on this form.  See ${profile.name}'s full profile. 
          </div>

          <div class="row">
              <div class="col"><img src=${profile.avatar_url}">
                  <div class="col">
                      <p class="bio"> ${profile.bio}</p>
                  </div>
              </div>
              <div class="card-body">
                  <br><br>
                  <hr id="${color}">
                  <p class="locale">${profile.location}.</p>
              </div>
              <br>
              <ul class="list-group list-group-flush ${color} mt-5">
                  <li class="list-group-item">GitHub Profile: <p id="right">${profile.html_url}</p>
                  </li>
                  <li class="list-group-item">Blog: <p id="right">${profile.blog}</p>
                  </li>
                  <li class="list-group-item">Public Repos: <p id="right">${profile.public_repos}</p>
                  </li>
                  <li class="list-group-item">Stars: <p id="right"> ${stars} </p>
                  </li>
                  <li class="list-group-item">Followers: <p id="right">${profile.followers}</p>
                  </li>
                  <li class="list-group-item">Following: <p id="right">${profile.following}</p>
                  </li>
              </ul>

              <p class="ml-4">Links:</p>
              <div class="card-footer">
                  <a href="${profile.html_url}" target="_blank" class="card-link ${color}">Profile </a>
                  <a href="mailto:${profile.email}" class="card-link ${color}">Email </a>
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
