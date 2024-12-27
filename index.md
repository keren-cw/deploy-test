---
layout: default
title: Release History Dashboard
---

# Release History Dashboard

## Release Metrics

<div class="metrics-grid">
  <div class="metric-card">
    <h3>Average Approval Time</h3>
    {% assign now = 'now' | date: '%s' %}
    {% assign week_ago = now | minus: 604800 %}
    {% assign month_ago = now | minus: 2592000 %}
    
    {% assign week_total = 0 %}
    {% assign week_count = 0 %}
    {% assign month_total = 0 %}
    {% assign month_count = 0 %}
    
    {% for release in sorted_releases %}
      {% assign release_time = release.release_date | date: '%s' | plus: 0 %}
      {% if release.approval_date %}
        {% assign approval_time = release.approval_date | date: '%s' | plus: 0 %}
        {% assign time_diff = approval_time | minus: release_time %}
        
        {% if release_time > week_ago %}
          {% assign week_total = week_total | plus: time_diff %}
          {% assign week_count = week_count | plus: 1 %}
        {% endif %}
        
        {% if release_time > month_ago %}
          {% assign month_total = month_total | plus: time_diff %}
          {% assign month_count = month_count | plus: 1 %}
        {% endif %}
      {% endif %}
    {% endfor %}
    
    <div class="metric-value">
      <p><strong>Last 7 days:</strong> {{ week_total | divided_by: week_count | divided_by: 60 }} minutes</p>
      <p><strong>Last 30 days:</strong> {{ month_total | divided_by: month_count | divided_by: 60 }} minutes</p>
    </div>
  </div>

  <div class="metric-card">
    <h3>Release Pace</h3>
    {% assign week_releases = 0 %}
    {% assign month_releases = 0 %}
    
    {% for release in sorted_releases %}
      {% assign release_time = release.release_date | date: '%s' | plus: 0 %}
      {% if release_time > week_ago %}
        {% assign week_releases = week_releases | plus: 1 %}
      {% endif %}
      {% if release_time > month_ago %}
        {% assign month_releases = month_releases | plus: 1 %}
      {% endif %}
    {% endfor %}
    
    <div class="metric-value">
      <p><strong>Last 7 days:</strong> {{ week_releases | divided_by: 7.0 | round: 2 }} releases/day</p>
      <p><strong>Last 30 days:</strong> {{ month_releases | divided_by: 30.0 | round: 2 }} releases/day</p>
    </div>
  </div>
</div>

## Approval Time Trends

<div id="approval-chart"></div>

## Recent Releases

<div class="releases-grid">
{% for release in sorted_releases limit:10 %}
  <div class="release-card">
    <h3>{{ release.title }}</h3>
    <div class="release-meta">
      <p><strong>Tag:</strong> {{ release.tag }}</p>
      <p><strong>Released:</strong> {{ release.release_date | date: "%Y-%m-%d %H:%M" }}</p>
      {% if release.approval_date %}
      <p><strong>Approved:</strong> {{ release.approval_date | date: "%Y-%m-%d %H:%M" }}</p>
      <p><strong>Approvers:</strong> {{ release.approvers }}</p>
      <p><strong>Approval Time:</strong> {{ release.approval_time_minutes }} minutes</p>
      {% else %}
      <p class="pending">Pending Approval</p>
      {% endif %}
    </div>
    <a href="{{ site.baseurl }}/releases/{{ release.tag }}" class="release-link">View Details →</a>
  </div>
{% endfor %}
</div>

<style>
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin: 30px 0;
}

.metric-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.metric-card h3 {
  margin-top: 0;
  color: #2c3e50;
}

.metric-value {
  font-size: 1.1em;
  margin-top: 15px;
}

.releases-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin: 30px 0;
}

.release-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.release-card:hover {
  transform: translateY(-2px);
}

.release-card h3 {
  margin-top: 0;
  color: #2c3e50;
}

.release-meta {
  margin: 15px 0;
  font-size: 0.95em;
}

.release-meta p {
  margin: 5px 0;
}

.pending {
  color: #e67e22;
  font-weight: bold;
}

.release-link {
  display: inline-block;
  margin-top: 10px;
  color: #3498db;
  text-decoration: none;
}

.release-link:hover {
  text-decoration: underline;
}

#approval-chart {
  margin: 30px 0;
  height: 400px;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style>

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
        marker: {
            color: '#3498db',
            opacity: 0.8
        }
    }];

    var layout = {
        title: 'Release Approval Times',
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        xaxis: {
            title: 'Release Tag',
            tickangle: -45,
            gridcolor: '#eee'
        },
        yaxis: {
            title: 'Time to Approval (minutes)',
            gridcolor: '#eee'
        },
        hovermode: 'closest',
        margin: {
            l: 60,
            r: 20,
            t: 40,
            b: 80
        }
    };

    var config = {
        responsive: true
    };

    Plotly.newPlot('approval-chart', data, layout, config);
});</script> 