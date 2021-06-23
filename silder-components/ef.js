/*
 * @Author: your name
 * @Date: 2021-03-21 10:48:40
 * @LastEditTime: 2021-03-21 11:11:06
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \web-client-beta\src\utils\ef.js
 */
export function ef(str){
	function AA() { 
		let  _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="; 
		
		let _utf8_encode = function (string) { 
			string = string.replace(/\r\n/g,"\n"); 
			var utftext = ""; 
			for (var n = 0; n < string.length; n++) { 
				var c = string.charCodeAt(n); 
				if (c < 128) { 
					utftext += String.fromCharCode(c); 
				} else if((c > 127) && (c < 2048)) { 
					utftext += String.fromCharCode((c >> 6) | 192); 
					utftext += String.fromCharCode((c & 63) | 128); 
				} else { 
					utftext += String.fromCharCode((c >> 12) | 224); 
					utftext += String.fromCharCode(((c >> 6) & 63) | 128); 
					utftext += String.fromCharCode((c & 63) | 128); 
				} 
				
			} 
			return utftext; 
		}


		this.encode = function (input) {
			var output = ""; 
			var chr1, chr2, chr3, enc1, enc2, enc3, enc4; 
			var i = 0; 
			input = _utf8_encode(input); 
			while (i < input.length) { 
				chr1 = input.charCodeAt(i++); 
				chr2 = input.charCodeAt(i++); 
				chr3 = input.charCodeAt(i++); 
				enc1 = chr1 >> 2; 
				enc2 = ((chr1 & 3) << 4) | (chr2 >> 4); 
				enc3 = ((chr2 & 15) << 2) | (chr3 >> 6); 
				enc4 = chr3 & 63; 
				if (isNaN(chr2)) { 
					enc3 = enc4 = 64; 
				} else if (isNaN(chr3)) { 
					enc4 = 64; 
				} 
				output = output + 
				_keyStr.charAt(enc1) + _keyStr.charAt(enc2) + 
				_keyStr.charAt(enc3) + _keyStr.charAt(enc4); 
			} 
			return output; 
		} 
		
		
	}
	var aa = new AA();
	return aa.encode(str);
}
export function rrh($,rdata){	
	function getProp(name){	
		return navigator[name]
	};
	var propNames = [];
	propNames.push("appName");
	propNames.push("userAgent");
	propNames.push("appVersion");
	var ret = {};var i = 0;
	for(i = 0;i<propNames.length;i++){
		ret[propNames[i]]=getProp(propNames[i]);
	}var xret = JSON.stringify(ret);
	var xxret = ef(xret);
	return {"extend":xxret};
}