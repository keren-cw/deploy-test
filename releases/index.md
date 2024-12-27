---
layout: default
title: Release History
---

# Release History

This page lists all approved releases in chronological order.

{% for release in site.pages %}
  {% if release.path contains 'releases/' and release.name != 'index.md' %}
    * [{{ release.title }}]({{ release.url | relative_url }})
  {% endif %}
{% endfor %} 