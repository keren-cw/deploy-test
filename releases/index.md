---
layout: default
title: Release History
---

# Release History

## Approval Time Analysis
<canvas id="approvalTimeChart" width="800" height="400"></canvas>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns"></script>
<script>
document.addEventListener('DOMContentLoaded', function() {
    const releases = [
    {% for release in site.pages %}
      {% if release.path contains 'releases/' and release.name != 'index.md' %}
        {
          tag: "{{ release.tag }}",
          releaseDate: new Date("{{ release.release_date }}"),
          approvalDate: new Date("{{ release.approval_date }}")
        },
      {% endif %}
    {% endfor %}
    ];

    // Sort releases by date
    releases.sort((a, b) => a.releaseDate - b.releaseDate);

    // Calculate approval times in hours
    const data = releases.map(release => {
        const approvalTime = (release.approvalDate - release.releaseDate) / (1000 * 60 * 60); // Convert to hours
        return {
            x: release.releaseDate,
            y: approvalTime,
            tag: release.tag
        };
    });

    const ctx = document.getElementById('approvalTimeChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Approval Time (hours)',
                data: data,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day',
                        displayFormats: {
                            day: 'MMM D'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Release Date'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Time to Approval (hours)'
                    },
                    beginAtZero: true
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        title: function(context) {
                            return context[0].raw.tag;
                        },
                        label: function(context) {
                            return `Approval Time: ${context.raw.y.toFixed(1)} hours`;
                        }
                    }
                }
            }
        }
    });
});
</script>

## Release List

{% for release in site.pages %}
  {% if release.path contains 'releases/' and release.name != 'index.md' %}
    * [{{ release.title }}]({{ release.url | relative_url }})
  {% endif %}
{% endfor %} 