function getElement(html: string) {
  var template = document.createElement('template') as HTMLTemplateElement;
  template.innerHTML = html.trim();
  return template.content.firstChild as HTMLElement;
}

export {
  getElement
}
