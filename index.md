---
title: My Page
---

<ul>
{% for page in site.pages %}
  {% assign parts = page.url | split: '/' %}
  {% if parts.size > 1 %}
    {% assign dir = parts[1] %}
    {% unless dirs contains dir %}
      {% assign dirs = dirs | push: dir %}
      <li><a href="{{ '/' | append: dir | relative_url }}/">{{ dir }}</a></li>
    {% endunless %}
  {% endif %}
{% endfor %}
</ul>