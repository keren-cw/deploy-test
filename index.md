---
layout: default
title: Release History
---

# Release History

## Latest Releases

{% assign release_files = site.static_files | where: "extname", ".md" | where_exp: "file", "file.path contains '/releases/'" %}
{% assign releases = "" | split: "" %}
{% for file in release_files %}
  {% capture release_content %}
    {% include_relative {{ file.path }} %}
  {% endcapture %}
  {% assign releases = releases | push: release_content %}
{% endfor %}

{% assign sorted_releases = releases | sort: "release_date" | reverse %}
{% for release in sorted_releases %}
### {{ release.title }}
- **Tag**: {{ release.tag }}
- **Release Date**: {{ release.release_date | date: "%Y-%m-%d %H:%M:%S" }}
{% if release.approval_date %}
- **Approval Date**: {{ release.approval_date | date: "%Y-%m-%d %H:%M:%S" }}
- **Approved By**: {{ release.approvers }}
- **Approval Time**: {% assign release_time = release.release_date | date: '%s' | plus: 0 %}{% assign approval_time = release.approval_date | date: '%s' | plus: 0 %}{% assign minutes = approval_time | minus: release_time | divided_by: 60 %}{{ minutes }} minutes
{% endif %}

[View Details]({{ site.baseurl }}/releases/{{ release.tag }})
{% endfor %}

## Approval Time Chart

<div id="approval-chart"></div>

<script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function() {
    var releases = [
        {% for release in sorted_releases %}
        {% if release.approval_date %}
        {
            name: "{{ release.tag }}",
            releaseDate: new Date("{{ release.release_date }}"),
            approvalDate: new Date("{{ release.approval_date }}"),
            approvers: "{{ release.approvers }}"
        },
        {% endif %}
        {% endfor %}
    ];

    var data = [{
        x: releases.map(r => r.name),
        y: releases.map(r => (new Date(r.approvalDate) - new Date(r.releaseDate)) / (1000 * 60)),
        text: releases.map(r => `Approved by: ${r.approvers}`),
        type: 'bar',
        name: 'Approval Time (minutes)'
    }];

    var layout = {
        title: 'Release Approval Times',
        xaxis: {
            title: 'Release Tag',
            tickangle: -45
        },
        yaxis: {
            title: 'Time to Approval (minutes)'
        },
        hovermode: 'closest'
    };

    Plotly.newPlot('approval-chart', data, layout);
});</script> 