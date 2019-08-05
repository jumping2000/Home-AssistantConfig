 
function loadScript(remote_template){
	if(window[`scriptLoaded_${remote_template}`]){
		return;
	}

	var script = document.createElement("script");
	script.src = `/local/content-card-remote-control/${remote_template}/remote-html.js`;
	script.type = "text/javascript";
	script.async = false;
	document.head.appendChild(script); 
	window[`scriptLoaded_${remote_template}`] = true;
	
}


class ContentCardRemoteControl extends HTMLElement {

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  setConfig(config) {
  	loadScript(config.remote_template);
    const root = this.shadowRoot;
    if (root.lastChild) root.removeChild(root.lastChild);

    const cardConfig = Object.assign({}, config);
    this._config = cardConfig
  }

  
  set hass(hass) {
  	

  
    const config = this._config;
    
    loadScript(config.remote_template);
    
    try{
    	const html = window[`getRemoteHtml_${config.remote_template}`](config);
        const css = window[`getRemoteStyle_${config.remote_template}`](config);
        
        
        const root = this.shadowRoot;
        this._hass = hass;
        // root.lastChild.hass = hass;
   
        const card = document.createElement('ha-card');
        if(!this.content && window[`scriptLoaded_${config.remote_template}`]){
             this.content = document.createElement('div');
             const style = document.createElement('style');
             style.textContent = css;
             this.content.innerHTML = html;
             card.appendChild(this.content);
             card.appendChild(style);
     
             root.appendChild(card);
             
             this._bindButtons(card, this._hass, this._config);
        }
    
    } catch(err){
    	console.log('waiting for remote load');
    	loadScript(config.remote_template);
    }
    
  }
  

    
  _bindButtons(card, hass, config){
  	var buttons =  card.getElementsByClassName(`myButton-${config.remote_template}`);
    var i;
    for (i = 0; i < buttons.length; i++) { 
    	let button = buttons[i]
        button.addEventListener('click', function(source){
        	console.log(button.id);
        	hass.callService('broadlink',
        	                  'send', 
        	                  {packet: [getPacket(button.id, config)], host: config.broadlink_host}
                             );
        });
    }
  }
  
  


  getCardSize() {
    return 3;
  }
  

}

 function getPacket(buttonId, config){
  	return config.buttons[buttonId];
  }

customElements.define('content-card-remote-control', ContentCardRemoteControl);
