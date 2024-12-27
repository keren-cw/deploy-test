const fs = require('fs');
const yaml = require('js-yaml');

function loadConfig() {
  const configPath = '.github/config/app.yml';
  const configFile = fs.readFileSync(configPath, 'utf8');
  return yaml.load(configFile);
}

function getGitConfig() {
  const config = loadConfig();
  return {
    name: config.git.user.name,
    email: config.git.user.email
  };
}

function getAppConfig() {
  const config = loadConfig();
  return {
    name: config.app.name,
    email: config.app.email,
    tokenAction: config.app.token_action
  };
}

function getReviewers() {
  const config = loadConfig();
  return config.reviewers;
}

function getCommitMessage(type, ...args) {
  const config = loadConfig();
  const template = config.git.commit_messages[type];
  return args.length > 0 ? template.replace(/%s/g, args[0]) : template;
}

module.exports = {
  getGitConfig,
  getAppConfig,
  getReviewers,
  getCommitMessage
}; 