module.exports = async ({ github, context, core }) => {
  const tagName = context.payload.pull_request.head.ref.replace('release-approval-', '');
  
  // Get release info
  const releases = await github.rest.repos.listReleases({
    owner: context.repo.owner,
    repo: context.repo.repo
  });
  
  const release = releases.data.find(r => r.tag_name === tagName && r.prerelease);
  if (!release) {
    core.setFailed(`No pre-release found for tag ${tagName}`);
    return;
  }

  // Get PR reviews
  const reviews = await github.rest.pulls.listReviews({
    owner: context.repo.owner,
    repo: context.repo.repo,
    pull_number: context.payload.pull_request.number
  });
  
  // Get unique approvers
  const approvers = [...new Set(
    reviews.data
      .filter(review => review.state === 'APPROVED')
      .map(review => review.user.login)
  )];

  // Calculate approval time
  const releaseDate = new Date(release.created_at);
  const approvalDate = new Date(context.payload.pull_request.merged_at);
  const approvalTimeMinutes = Math.floor((approvalDate - releaseDate) / (1000 * 60));

  // Read current file content
  const { data: fileContent } = await github.rest.repos.getContent({
    owner: context.repo.owner,
    repo: context.repo.repo,
    path: `releases/${tagName}.md`,
    ref: 'main'
  });

  // Create new file content
  const content = [
    '---',
    'layout: default',
    `title: "Release Approval: ${release.name}"`,
    `tag: "${tagName}"`,
    `release_date: "${release.created_at}"`,
    `approval_date: "${context.payload.pull_request.merged_at}"`,
    `approvers: "${approvers.join(', ')}"`,
    `approval_time_minutes: ${approvalTimeMinutes}`,
    '---',
    '',
    `# Release Approval: ${release.name}`,
    '',
    `- **Tag**: ${tagName}`,
    `- **Release Date**: ${release.created_at}`,
    `- **Approval Date**: ${context.payload.pull_request.merged_at}`,
    `- **Approved By**: ${approvers.join(', ')}`,
    `- **Approval Time**: ${approvalTimeMinutes} minutes`,
    '',
    '## Release Notes',
    release.body || ''
  ].join('\n');

  // Update file
  await github.rest.repos.createOrUpdateFileContents({
    owner: context.repo.owner,
    repo: context.repo.repo,
    path: `releases/${tagName}.md`,
    message: 'docs: update release details with approval date and approvers',
    content: Buffer.from(content).toString('base64'),
    sha: fileContent.sha,
    branch: 'main'
  });
}; 