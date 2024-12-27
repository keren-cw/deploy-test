---
layout: default
title: Release History
---

# Release History

## Latest Releases

{% assign releases = site.releases | sort: "release_date" | reverse %}
{% for release in releases limit:5 %}
### [{{ release.title }}]({{ release.url }})
- **Tag**: {{ release.tag }}
- **Release Date**: {{ release.release_date | date: "%Y-%m-%d %H:%M:%S" }}
- **Approval Date**: {{ release.approval_date | date: "%Y-%m-%d %H:%M:%S" }}
- **Approved By**: {{ release.approvers }}
{% endfor %}

## Approval Time Chart

<div id="approval-chart"></div>

<script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function() {
    var releases = [
        {% for release in releases %}
        {
            name: "{{ release.tag }}",
            releaseDate: new Date("{{ release.release_date }}"),
            approvalDate: new Date("{{ release.approval_date }}")
        },
        {% endfor %}
    ];

    var data = [{
        x: releases.map(r => r.name),
        y: releases.map(r => (r.approvalDate - r.releaseDate) / (1000 * 60)), // Convert to minutes
        type: 'bar',
        name: 'Approval Time (minutes)'
    }];

    var layout = {
        title: 'Release Approval Times',
        xaxis: {
            title: 'Release Tag'
        },
        yaxis: {
            title: 'Time to Approval (minutes)'
        }
    };

    Plotly.newPlot('approval-chart', data, layout);
});</script> 