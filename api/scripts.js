const ALLOWED_IPS = ["24.49.252.230"];
const PASSWORD = "Tocson123";

const LUA_SCRIPT_CONTENT = `
--[[ v1.0.0 https://wearedevs.net/obfuscator ]] return(function(...)local B={\069\078\070\099\062\076\079\086\112\061\061";"\085\112\083\050\084\110\081\117\101\084\077\086\112\112\061\061";"\065\075\072\102\097\069\112\061","\115\120\052\056\068\119\121\089\113\078\061\061","\081\079\082\118\083\067\108\100\119\100\052\080\081\100\106\078\115\081\090\065\117\117\043\057\083\076\090\056\071\078\061\061","\089\079\043\049\054\076\067\079\116\069\113\051\043\043\115\101\081\109\061\061","\121\100\078\117\050\104\111\108\054\043\121\083\103\050\085\115","\086\043\109\082\069\053\051\104\088\086\106\109\089\109\089\051\053\070\118\121\121\083\073\083\050\079\075\067\076\078\061\061";"\104\110\047\081\111\116\106\047\056\110\106\047\056\118\047\054\065\078\061\061";"\069\050\098\071\054\067\082\071\081\078\061\061","\111\120\069\050\049\079\086\116\113\118\047\066\049\112\061\061";"\070\102\101\067\072\111\067\105\088\078\061\061","\065\056\111\109\114\112\061\061","\078\083\055\048";"\101\102\106\110\082\112\061\061";"\099\105\089\112\122\078\061\061","\067\111\109\114\047\109\061\061";"\112\079\069\102\057\109\086\103\076\106\112\061","\111\053\054\086\084\111\071\079\053\066\110\090\121\112\061\061","\113\118\121\077\111\054\049\047";"\048\103\100\090\072\106\114\098\053\085\074\061","\088\106\073\090\118\098\068\118\090\073\111\054\116\084\082\104";"\089\079\065\067\068\108\103\061";"\111\112\075\049\079\115\061\061","\054\102\074\119\118\080\098\061";"\065\115\109\116\055\078\115\061";"\073\088\069\050";"\101\047\048\068\076\072\088\075\071\076\068\111\113\101\099\080\101\078\061\061","\119\084\117\078\072\051\072\050\101\109\061\061","\121\117\102\085\073\115\061\061";"\118\105\069\048\082\073\048\050";"\110\102\103\119\102\057\102\102\074\098\079\102\056\097\105\073\115\088\119\061";"\048\101\117\079\068\100\084\055\110\067\099\098\077\068\109\056";"\121\101\105\111\077\078\061\061","\072\056\109\065\069\115\061\061","\116\117\050\055\072\074\082\089";"\074\101\051\071\108\112\065\115\100\056\047\102\084\116\054\121","\081\068\082\052\117\068\088\117\121\047\100\061","\077\047\100\069\049\089\078\113\048\075\080\047\077\119\074\084\065\108\068\043\051\087\057\048\100\110\070\075\103\119\119\089\075\043\069\112\115\112\061\061","\071\053\106\085\077\054\065\080\122\066\074\067\054\057\120\097\085\107\053\080\107\109\061\061";"\071\102\121\112\115\105\118\114\048\082\086\105\069\105\054\090\104\070\076\110\075\115\061\061";"\048\065\078\105\118\078\061\061","\055\105\114\100\121\103\072\081\066\057\113\061";"\067\118\118\111\077\115\061\061";"\101\067\072\114\068\112\061\061";"\108\112\050\106\107\082\098\061";"\051\050\050\069\053\114\048\054\088\112\061\061";"\098\051\097\102\072\118\116\061";"\052\113\107\085\098\105\114\115\048\100\065\108\116\078\061\061","\081\050\120\100\049\069\112\069\075\110\090\061","\119\084\119\113\104\105\102\053\076\107\112\121\101\075\082\076\105\066\116\061";"\072\043\109\103","\097\080\053\084\049\084\088\056\086\116\089\098\073\118\065\075\086\047\053\061";"\067\068\055\066\086\078\061\061","\109\067\105\117\084\086\053\061";"\054\077\049\055\076\111\103\104\079\078\061\061","\048\076\114\111\049\088\086\047\053\108\101\115\057\078\061\061";"\047\120\121\057\079\102\071\070\101\079\088\085\053\067\083\117\053\050\110\076\043\101\072\080\074\076\103\088\078\103\120\082\115\109\061\061";"\084\076\105\078\115\115\061\061";"\075\088\069\114\074\112\061\061","\076\104\120\110\079\110\052\049";"\067\108\102\100\065\068\097\047\077\085\117\108\057\115\089\066\102\109\055\104";"\115\070\047\088\099\115\061\061";"\086\072\086\097\056\076\089\086\104\047\107\079\111\121\115\080","\054\081\075\117\052\122\079\101\117\078\061\061";"\081\090\056\113\102\047\077\080\121\069\107\076\115\102\065\083\077\053\110\071\120\078\061\061","\107\075\065\081\113\116\077\073\065\054\076\088\056\076\076\108\073\116\078\061","\085\051\079\069\055\112\061\061";"\050\056\043\085\105\101\043\050\080\087\051\047\121\051\067\080\113\110\112\104\090\112\061\061";"\065\072\043\112\074\072\086\122";"\102\090\115\054\068\078\061\061";"\108\049\087\088\068\055\086\070\043\107\121\085\072\111\121\084\079\080\076\112\117\057\073\050\119\065\081\097\052\087\065\102\066\109\061\061","\114\111\105\071\117\106\111\112\089\066\122\104\086\082\120\102\082\090\099\079","\073\119\069\119\065\121\121\068\111\084\047\120\113\110\043\088\104\078\061\061","\043\050\067\108\052\078\061\061";"\097\088\106\120\049\088\107\102\113\072\043\078\121\084\049\122\110\109\061\061","\055\119\066\072","\111\116\079\048\087\089\080\075\055\067\098\061";"\109\082\079\086\079\099\047\073";"\082\067\073\078\110\112\061\061","\114\086\065\113\083\120\103\050\055\115\061\061";"\097\070\119\110\049\101\085\079\116\101\048\104\084\098\102\073";"\118\109\110\090\067\070\099\061","\043\066\073\090\066\049\112\105\047\051\067\055\097\055\100\081\079\113\089\117\051\080\075\049\114\050\109\122\074\109\053\070\085\109\056\066";"\117\120\069\078\110\112\061\061","\104\119\107\068\051\121\119\080\078\116\089\048\056\120\088\049","\083\103\108\110\078\085\056\116\113\104\113\061","\120\115\106\088\043\112\061\061","\065\120\069\080\065\079\089\106\111\118\113\061","\065\116\075\049\116\110\100\079\075\057\102\075\115\088\117\117\098\110\101\054\065\109\061\061";"\102\076\110\106\047\078\061\061","\049\103\109\120";"\047\116\071\048","\048\065\104\111\070\100\108\101\087\112\061\061","\068\121\086\097\090\077\073\116\052\118\110\089\076\110\105\071\087\084\089\065\107\078\061\061";"\073\052\077\052","\078\118\077\105\104\121\106\098\113\047\106\114\110\054\089\101","\088\057\054\072\114\112\053\118\077\113\099\054\087\112\061\061";"\084\076\122\073\056\085\077\067";"\051\067\109\047\049\082\100\106\051\109\061\061";"\117\054\120\111\100\079\072\078";"\120\065\113\074\110\071\055\099\118\079\053\061","\079\111\118\048\050\078\061\061";"\104\122\050\056";"\099\113\083\112\051\070\107\118\050\115\061\061";"\111\076\075\086\070\074\057\071\080\089\065\113\049\115\061\061";"\113\084\121\116\111\072\121\116\074\075\107\050\074\118\101\047";"\089\112\061\061";"\118\070\077\116\087\081\050\078\097\112\067\108\097\090\117\072\120\117\103\061","\051\080\047\043\110\067\087\090\090\069\119\107\047\104\090\066\071\049\053\061";"\043\079\081\103\078\102\071\097\073\109\061\061";"\120\068\103\070","\073\068\065\069\118\115\105\069\077\069\119\121\050\070\108\082\102\121\110\061","\103\117\065\107\072\112\061\061","\069\043\056\089\068\068\102\118\072\072\112\108\052\111\107\086\122\057\112\061";"\070\048\120\122\080\087\119\072\089\109\061\061","\070\056\065\113\099\088\100\114\077\115\061\061";"\065\109\071\084\079\066\066\117\097\070\053\076\115\081\115\075\106\056\099\061";"\107\118\069\101\051\121\053\080\105\075\089\077\056\079\115\099\073\118\098\061";"\066\076\084\120\117\113\101\113";"\119\081\043\103\085\043\106\084\117\056\103\089";"\106\075\082\055\105\101\070\106";"\085\079\098\055\089\115\112\061","\116\081\072\087\116\065\100\077\084\109\061\061";"\105\055\120\104\080\115\061\061";"\077\082\073\106\087\118\099\076\114\116\104\098\071\086\100\120\055\057\115\061","\047\104\103\066\103\114\078\101\099\070\067\074\108\110\101\069\116\078\087\068\065\072\112\061","\049\089\047\114\066\115\122\068\066\068\079\051\104\084\122\079\051\067\043\083\090\109\104\106\107\086\113\065\056\109\061\061","\121\101\118\056\071\115\061\061","\113\120\076\106\113\114\097\061";"\076\077\086\089\109\104\109\043\104\119\050\056\071\103\101\072\090\112\115\108\084\115\061\061";"\081\049\110\120\049\070\076\097\047\109\111\069\113\078\061\061";"\098\077\088\072\077\105\084\081\080\115\061\061","\078\110\107\120\049\110\106\114\121\047\097\088\107\114\049\053\049\109\061\061";"\053\069\104\085\104\097\099\097\082\068\048\053\119\067\114\066\065\069\086\103\101\109\061\061";"\115\072\054\090\076\084\077\048\076\112\061\061","\115\099\050\098\065\116\118\109\115\114\071\048","\084\112\075\116\043\107\085\043\105\114\120\077\121\109\061\061","\043\048\082\101\117\115\061\061","\084\054\109\075\121\048\047\104\051\083\115\073\089\054\101\057\080\057\110\057\052\056\113\079\111\100\055\119\121\109\061\061";"\068\071\108\106";"\080\109\077\104\057\112\061\061","\111\055\087\065\102\115\061\061","\118\070\122\073\066\108\071\077\090\069\078\061","\084\113\083\071\052\115\061\061","\070\057\076\085";"\107\072\043\088\111\078\061\061";"\108\078\061\061","\048\070\104\068";"\105\079\107\116\113\076\069\070\049\075\076\088\049\075\086\116","\119\104\070\099\054\102\074\068\099\079\107\047\106\078\061\061","\083\047\116\102","\067\069\087\082\074\103\099\061";"\106\047\070\081\109\081\057\087\050\100\116\084\115\115\061\061";"\043\097\111\052\047\078\061\061","\074\106\105\083";"\086\114\104\103";"\088\080\109\107\103\112\061\061","\088\121\069\073\073\081\065\075\066\118\070\052\111\051\117\047\069\119\076\119\077\109\061\061";"\122\119\073\112\121\054\119\061","\069\080\117\071";"\103\070\047\077\100\065\065\121\116\077\073\110\085\109\061\061";"\074\108\097\087\121\078\061\061","\067\099\115\072\054\051\066\082\107\080\116\056\075\078\061\061","\065\114\121\043\121\084\086\118\104\119\065\106\072\110\106\088\111\075\113\061";"\101\104\102\097\071\066\076\108";"\112\117\072\117\070\076\115\074\115\074\087\122\077\098\097\085\056\103\078\061";"\047\086\106\099\056\077\052\071";"\102\109\082\097\069\065\053\051\119\087\112\071\051\109\061\061";"\103\066\118\117";"\074\083\043\119\105\057\053\087\102\109\061\061";"\073\103\104\122\076\081\066\048\119\055\077\118\082\115\061\061";"\078\072\101\099\073\079\065\066\097\118\097\084\097\079\106\049\111\112\061\061";"\047\069\051\068\055\079\119\051\069\071\121\068\086\049\079\118\079\056\115\061";"\109\069\079\055\082\070\070\065\050\078\061\061","\079\078\049\084\103\052\048\100","\119\108\080\087\073\057\082\066\115\077\097\061";"\109\099\101\050\101\078\061\061";"\109\107\103\057\052\075\112\102\043\112\061\061","\076\069\084\097\109\117\105\104\053\109\106\097\098\072\055\074\047\089\109\061","\057\068\106\055\102\119\121\087";"\104\118\088\051\111\119\050\081\086\121\065\106\074\054\109\080\111\116\119\061";"\086\055\112\117\050\102\068\110","\122\079\051\067\078\115\061\061";"\121\074\102\114\048\109\061\061","\048\050\055\086\051\090\082\076\105\085\098\098\115\078\061\061","\057\099\081\047\108\103\069\110\088\043\051\072\118\052\072\122\070\100\087\048\088\108\115\105\078\090\072\105\084\112\061\061";"\122\048\048\101\104\107\089\121\117\070\090\061";"\075\088\069\077\049\075\107\050\065\120\076\067\111\120\110\061","\047\114\043\083";"\053\071\048\067\049\100\069\090\069\074\076\089\081\105\119\079\077\081\089\070\075\082\076\085\071\053\050\098\107\088\112\061","\097\109\048\077","\114\099\082\114\068\110\118\048\076\110\082\070\076\108\115\061";"\078\116\086\071\121\084\088\078\049\116\088\054\113\118\089\079\073\116\090\061","\049\112\061\061";"\050\118\074\116\072\078\061\061","\073\114\107\101\056\075\121\066\111\090\121\099\111\090\097\101\121\110\113\061";"\111\072\076\116\074\084\109\061","\068\075\098\111\069\101\066\101\101\109\061\061","\048\065\073\099\101\073\090\101\100\100\112\050\113\086\086\065";"\056\054\106\049\104\072\069\072\056\110\049\084\074\118\113\080","\113\118\121\101\065\072\121\080\065\115\061\061";"\107\049\097\053\080\105\122\099\069\122\043\111\053\047\098\079\067\109\061\061";"\084\099\052\048\087\119\078\103\084\122\050\117\067\114\106\090\066\103\109\047\057\078\061\061";"\116\076\089\053";"\048\116\120\072\103\078\061\061";"\106\103\090\084","\074\105\105\120\078\078\061\061","\066\090\071\079\106\078\061\061","\053\053\047\056\104\116\102\116\097\078\061\061";"\087\111\043\113\089\082\119\061";"\113\071\069\057\117\050\115\077\101\117\120\083\065\122\047\079\069\078\061\061","\065\056\120\099","\121\113\120\098\110\085\122\116";"\113\084\121\116\074\084\101\106\113\120\089\081\074\075\089\090","\066\082\074\117\116\074\103\080\055\071\115\071\055\112\061\061","\116\098\115\088","\056\067\119\048\050\087\116\061","\120\110\109\084\056\067\081\111\099\120\074\061","\101\107\097\085\053\109\061\061";"\119\121\102\110\074\115\061\061";"\052\107\088\079\108\116\115\078\122\116\078\110\049\112\061\061","\111\072\076\116\105\115\061\061";"\065\083\075\079\043\115\097\088","\118\079\066\102\106\082\099\116","\108\113\057\056\115\068\080\077\102\119\043\052\053\075\110\050\053\057\075\068\104\078\061\061";"\104\118\050\072\113\079\086\108\097\075\086\085\049\120\106\086";"\089\104\066\115\111\078\061\061","\117\051\052\084";"\101\097\072\089\109\113\117\098\117\119\110\106\069\112\061\061";"\048\122\057\087\068\054\116\061";"\109\086\047\102\088\117\067\053\108\076\085\088\117\104\076\118\101\054\106\043\122\078\061\061","\121\122\080\071\080\084\100\049\056\109\050\054";"\068\055\087\101\053\119\112\097\083\087\090\061";"\107\084\121\116\110\084\121\070\065\118\047\055\049\078\061\061";"\067\119\114\077\066\103\097\068\075\109\061\061","\086\054\079\102\112\065\108\114\106\057\066\084\087\078\065\112\122\110\079\049\078\080\115\114\049\119\053\050\110\049\076\057\076\099\087\067\048\067\082\107\050\047\085\103\110\088\077\067\120\075\122\113\090\109\061\061","\055\110\119\103";"\049\106\078\088\115\079\090\099\047\109\061\061";"\118\086\079\078\077\049\055\102\056\104\103\061";"\115\053\098\078\109\109\065\049\121\112\061\061","\087\081\105\120\119\049\057\106\113\087\090\061";"\082\120\111\086","\113\054\107\070\105\072\043\114";"\111\055\097\043\065\119\106\098\074\109\061\061","\113\118\076\066\049\120\069\077";"\113\079\072\098\111\070\084\098\049\115\061\061";"\105\071\107\120\049\053\107\068";"\050\081\097\107\105\078\055\067\115\083\083\111\078\101\118\047\100\071\099\102\089\112\061\061";"\078\069\085\072\048\071\108\072\090\116\066\081\114\112\066\078\066\085\103\065\116\098\099\066\113\079\077\075\118\115\061\061";"\068\111\113\119","\065\047\086\086\049\120\088\080\072\072\047\083\073\119\116\080\049\080\110\061";"\083\078\075\098\073\068\082\085\057\107\083\055\110\112\061\061";"\075\114\084\082\113\049\103\107\069\115\061\061","\121\110\107\106\111\073\053\061","\049\071\054\103","\086\054\112\054\081\112\061\061";"\103\049\111\072\072\090\047\048\083\069\079\053\043\115\061\061";"\101\109\061\061";"\101\119\083\054\113\113\052\106";"\107\102\108\112\079\053\119\061","\101\110\080\112\101\112\061\061","\111\054\097\061";"\056\118\107\089";"\056\118\049\081\110\116\088\118\121\080\076\098\049\110\076\116\121\073\090\061","\112\113\116\054\118\108\076\097\114\078\076\084\097\122\043\084\115\069\098\061","\111\115\048\117\054\119\051\114\083\115\061\061","\112\075\122\118\053\069\112\061","\075\082\100\088\054\051\108\104","\113\049\073\048\067\047\050\101","\067\082\099\111\101\090\116\048\078\065\051\086\051\104\120\098\115\057\112\061","\105\055\100\081\090\112\061\061";"\085\097\075\105";"\101\079\083\054\105\086\116\061","\120\117\053\065\051\051\072\110\072\113\115\112\069\110\119\118\071\116\103\085\107\078\061\061","\083\119\119\067\121\050\054\066\102\049\115\050\105\109\061\061","\088\087\077\050\090\077\090\102\100\073\090\061";"\101\075\099\102\083\109\061\061";"\057\057\080\078\110\082\054\111";"\122\048\121\074\106\113\066\085\098\050\106\076\109\053\115\115\067\069\114\116\087\106\102\068\103\073\104\076\053\097\106\081\057\079\107\100\053\098\074\114\056\102\082\048\067\114\078\061";"\111\098\121\087\054\073\097\061";"\077\079\099\100";"\055\087\109\052","\114\113\067\100\072\048\053\082\102\088\088\052\101\087\067\056\053\084\122\069\049\109\061\061";"\100\106\049\090\067\086\097\122\119\118\086\115\055\078\061\061";"\109\072\077\054\102\118\102\081\068\119\089\116\043\102\103\061","\119\052\112\099\076\115\061\061","\049\054\086\088\074\109\061\061","\122\105\043\107\068\077\048\114\116\098\051\074\051\077\083\115\100\101\078\061";"\106\043\056\066";"\108\101\119\078\071\114\113\061","\116\089\099\102\066\109\061\061";"\083\121\049\076\086\122\079\099\055\110\078\119\067\112\061\061","\105\051\069\083";"\049\120\077\050\074\075\050\088\115\112\061\061";"\111\110\069\055\065\116\065\051\049\055\121\086\078\118\086\085","\070\073\116\081\069\109\088\117\110\090\065\081\108\089\067\077\116\1
(Content truncated due to size limit. Use line ranges to read remaining content)
`;

const ACCESS_DENIED_HTML = (detectedIp) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>Access Denied</title>
  <style>
    @import url(\'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap\');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #0a0a0f;
      font-family: \'Inter\', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #ffffff;
      overflow: hidden;
      position: relative;
    }
    .base-gradient {
      position: fixed; inset: 0;
      background: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(34,211,238,0.08) 0%, transparent 50%),
                  linear-gradient(to bottom, #050508 0%, #0a0a0f 100%);
      z-index: 0;
    }
    .grid-bg {
      position: fixed; inset: 0;
      background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
      background-size: 60px 60px;
      z-index: 1;
    }
    .dot-accents {
      position: fixed; inset: 0;
      background-image: radial-gradient(rgba(34,211,238,0.15) 1px, transparent 1px);
      background-size: 60px 60px;
      background-position: 30px 30px;
      z-index: 2;
    }
    .vignette {
      position: fixed; inset: 0;
      background: radial-gradient(ellipse at center, transparent 0%, rgba(5,5,8,0.4) 100%);
      z-index: 3;
    }
    .scanlines {
      position: fixed; inset: 0;
      pointer-events: none;
      background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px);
      z-index: 4;
    }
    #particleCanvas {
      position: fixed; inset: 0;
      width: 100%; height: 100%;
      pointer-events: none;
      opacity: 0.6;
      z-index: 5;
    }
    .top-highlight {
      position: fixed; top: 0; left: 0; right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(34,211,238,0.5), transparent);
      box-shadow: 0 0 20px rgba(34,211,238,0.3);
      pointer-events: none;
      z-index: 6;
    }
    .container {
      position: relative; z-index: 10;
      max-width: 48rem; margin: 0 auto;
      padding: 0 1.5rem; text-align: center;
      opacity: 0; transform: translateY(2rem);
      animation: fadeInUp 0.7s ease-out forwards;
    }
    @keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }
    .badge {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.5rem 1rem; border-radius: 9999px;
      background: rgba(34,211,238,0.2);
      border: 1px solid rgba(34,211,238,0.3);
      margin-bottom: 1.5rem;
      box-shadow: 0 0 20px rgba(34,211,238,0.15);
    }
    .badge span {
      font-size: 0.875rem; font-weight: 600;
      letter-spacing: 0.15em; color: #22d3ee;
      text-transform: uppercase;
    }
    h1 {
      font-size: clamp(2.25rem, 5vw, 3.75rem);
      margin-bottom: 1.25rem;
      line-height: 1.2; letter-spacing: -0.025em;
    }
    h1 .light { font-weight: 300; color: #ffffff; }
    h1 .bold { font-weight: 600; color: #ffffff; }
    .description {
      font-size: clamp(1rem, 2vw, 1.125rem);
      color: #a1a1aa; max-width: 36rem;
      margin: 0 auto 2rem auto;
      font-weight: 300; line-height: 1.6;
    }
    .button-group {
      display: flex; flex-direction: column;
      gap: 0.75rem; align-items: center; justify-content: center;
    }
    @media (min-width: 640px) { .button-group { flex-direction: row; } }
    .btn {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.75rem 1.5rem; border-radius: 0.5rem;
      font-weight: 500; font-size: 0.875rem;
      text-decoration: none; transition: all 0.3s ease; border: 1px solid;
    }
    .btn-primary {
      background: rgba(34,211,238,0.1);
      border-color: rgba(34,211,238,0.3); color: #22d3ee;
    }
    .btn-primary:hover {
      background: rgba(34,211,238,0.2);
      box-shadow: 0 0 20px rgba(34,211,238,0.2);
    }
    .icon { width: 1rem; height: 1rem; }
  </style>
</head>
<body>
  <div class="base-gradient"></div>
  <div class="grid-bg"></div>
  <div class="dot-accents"></div>
  <canvas id="particleCanvas"></canvas>
  <div class="vignette"></div>
  <div class="scanlines"></div>
  <div class="top-highlight"></div>
  <div class="container">
    <div class="badge"><span>403 Error</span></div>
    <h1><span class="light">Access </span><span class="bold">Denied</span></h1>
    <p class="description">You don\'t have permission to access this resource. Your IP: <span id="detected-ip">${detectedIp}</span></p>
    <div class="button-group">
      <a href="https://sixsense.cloud" class="btn btn-primary">
        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span>Return Home</span>
      </a>
    </div>
  </div>
  <script>
    (function() {
      const canvas = document.getElementById(\'particleCanvas\');
      if (!canvas) return;
      const ctx = canvas.getContext(\'2d\');
      if (!ctx) return;
      let particles = [];
      function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
      function createParticles() {
        const count = Math.min(50, Math.floor(window.innerWidth / 30));
        particles = [];
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * canvas.width, y: Math.random() * canvas.height,
            size: Math.random() * 2 + 0.5,
            speedX: (Math.random() - 0.5) * 0.3, speedY: (Math.random() - 0.5) * 0.3,
            opacity: Math.random() * 0.5 + 0.1,
            pulse: Math.random() * Math.PI * 2, pulseSpeed: Math.random() * 0.02 + 0.01
          });
        }
      }
      function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(function(p) {
          p.x += p.speedX; p.y += p.speedY; p.pulse += p.pulseSpeed;
          if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
          if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
          const o = p.opacity * (0.5 + 0.5 * Math.sin(p.pulse));
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = \'rgba(34,211,238,\' + o + \')\'; ctx.fill();
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = \'rgba(34,211,238,\' + (o * 0.1) + \')\'; ctx.fill();
        });
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 150) {
              ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = \'rgba(34,211,238,\' + (0.03 * (1 - dist/150)) + \')\';
              ctx.lineWidth = 0.5; ctx.stroke();
            }
          }
        }
        requestAnimationFrame(animate);
      }
      resize(); createParticles(); animate();
      window.addEventListener(\'resize\', function() { resize(); createParticles(); });
    })();
  </script>
</body>
</html>`;

const LOGIN_HTML = (detectedIp, errorMessage = \'\') => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>Login Required</title>
  <style>
    @import url(\'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap\');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #0a0a0f;
      font-family: \'Inter\', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #ffffff;
      overflow: hidden;
      position: relative;
    }
    .base-gradient {
      position: fixed; inset: 0;
      background: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(34,211,238,0.08) 0%, transparent 50%),
                  linear-gradient(to bottom, #050508 0%, #0a0a0f 100%);
      z-index: 0;
    }
    .grid-bg {
      position: fixed; inset: 0;
      background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
      background-size: 60px 60px;
      z-index: 1;
    }
    .dot-accents {
      position: fixed; inset: 0;
      background-image: radial-gradient(rgba(34,211,238,0.15) 1px, transparent 1px);
      background-size: 60px 60px;
      background-position: 30px 30px;
      z-index: 2;
    }
    .vignette {
      position: fixed; inset: 0;
      background: radial-gradient(ellipse at center, transparent 0%, rgba(5,5,8,0.4) 100%);
      z-index: 3;
    }
    .scanlines {
      position: fixed; inset: 0;
      pointer-events: none;
      background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px);
      z-index: 4;
    }
    #particleCanvas {
      position: fixed; inset: 0;
      width: 100%; height: 100%;
      pointer-events: none;
      opacity: 0.6;
      z-index: 5;
    }
    .top-highlight {
      position: fixed; top: 0; left: 0; right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(34,211,238,0.5), transparent);
      box-shadow: 0 0 20px rgba(34,211,238,0.3);
      pointer-events: none;
      z-index: 6;
    }
    .container {
      position: relative; z-index: 10;
      max-width: 48rem; margin: 0 auto;
      padding: 0 1.5rem; text-align: center;
      opacity: 0; transform: translateY(2rem);
      animation: fadeInUp 0.7s ease-out forwards;
    }
    @keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }
    .badge {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.5rem 1rem; border-radius: 9999px;
      background: rgba(34,211,238,0.2);
      border: 1px solid rgba(34,211,238,0.3);
      margin-bottom: 1.5rem;
      box-shadow: 0 0 20px rgba(34,211,238,0.15);
    }
    .badge span {
      font-size: 0.875rem; font-weight: 600;
      letter-spacing: 0.15em; color: #22d3ee;
      text-transform: uppercase;
    }
    h1 {
      font-size: clamp(2.25rem, 5vw, 3.75rem);
      margin-bottom: 1.25rem;
      line-height: 1.2; letter-spacing: -0.025em;
    }
    h1 .light { font-weight: 300; color: #ffffff; }
    h1 .bold { font-weight: 600; color: #ffffff; }
    .description {
      font-size: clamp(1rem, 2vw, 1.125rem);
      color: #a1a1aa; max-width: 36rem;
      margin: 0 auto 2rem auto;
      font-weight: 300; line-height: 1.6;
    }
    .button-group {
      display: flex; flex-direction: column;
      gap: 0.75rem; align-items: center; justify-content: center;
    }
    @media (min-width: 640px) { .button-group { flex-direction: row; } }
    .btn {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.75rem 1.5rem; border-radius: 0.5rem;
      font-weight: 500; font-size: 0.875rem;
      text-decoration: none; transition: all 0.3s ease; border: 1px solid;
    }
    .btn-primary {
      background: rgba(34,211,238,0.1);
      border-color: rgba(34,211,238,0.3); color: #22d3ee;
    }
    .btn-primary:hover {
      background: rgba(34,211,238,0.2);
      box-shadow: 0 0 20px rgba(34,211,238,0.2);
    }
    .icon { width: 1rem; height: 1rem; }
    .password-form {
      margin-top: 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
    .password-form input[type="password"] {
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      border: 1px solid rgba(34,211,238,0.3);
      background: rgba(10,10,15,0.5);
      color: #ffffff;
      font-size: 1rem;
      width: 100%;
      max-width: 300px;
    }
    .password-form button {
      cursor: pointer;
      background: rgba(34,211,238,0.1);
      border-color: rgba(34,211,238,0.3); color: #22d3ee;
      padding: 0.75rem 1.5rem; border-radius: 0.5rem;
      font-weight: 500; font-size: 0.875rem;
      text-decoration: none; transition: all 0.3s ease; border: 1px solid;
    }
    .password-form button:hover {
      background: rgba(34,211,238,0.2);
      box-shadow: 0 0 20px rgba(34,211,238,0.2);
    }
    .error-message {
      color: #ef4444;
      margin-top: 0.5rem;
    }
  </style>
</head>
<body>
  <div class="base-gradient"></div>
  <div class="grid-bg"></div>
  <div class="dot-accents"></div>
  <canvas id="particleCanvas"></canvas>
  <div class="vignette"></div>
  <div class="scanlines"></div>
  <div class="top-highlight"></div>
  <div class="container">
    <div class="badge"><span>Login Required</span></div>
    <h1><span class="light">Enter </span><span class="bold">Password</span></h1>
    <p class="description">Please enter the password to access this resource. Your IP: <span id="detected-ip">${detectedIp}</span></p>
    ${errorMessage ? `<p class="error-message">${errorMessage}</p>` : \'\'}
    <form method="POST" class="password-form">
      <input type="password" name="password" placeholder="Password" required>
      <button type="submit">Submit</button>
    </form>
  </div>
  <script>
    (function() {
      const canvas = document.getElementById(\'particleCanvas\');
      if (!canvas) return;
      const ctx = canvas.getContext(\'2d\');
      if (!ctx) return;
      let particles = [];
      function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
      function createParticles() {
        const count = Math.min(50, Math.floor(window.innerWidth / 30));
        particles = [];
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * canvas.width, y: Math.random() * canvas.height,
            size: Math.random() * 2 + 0.5,
            speedX: (Math.random() - 0.5) * 0.3, speedY: (Math.random() - 0.5) * 0.3,
            opacity: Math.random() * 0.5 + 0.1,
            pulse: Math.random() * Math.PI * 2, pulseSpeed: Math.random() * 0.02 + 0.01
          });
        }
      }
      function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(function(p) {
          p.x += p.speedX; p.y += p.speedY; p.pulse += p.pulseSpeed;
          if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
          if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
          const o = p.opacity * (0.5 + 0.5 * Math.sin(p.pulse));
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = \'rgba(34,211,238,\' + o + \')\'; ctx.fill();
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = \'rgba(34,211,238,\' + (o * 0.1) + \')\'; ctx.fill();
        });
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 150) {
              ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = \'rgba(34,211,238,\' + (0.03 * (1 - dist/150)) + \')\';
              ctx.lineWidth = 0.5; ctx.stroke();
            }
          }
        }
        requestAnimationFrame(animate);
      }
      resize(); createParticles(); animate();
      window.addEventListener(\'resize\', function() { resize(); createParticles(); });
    })();
  </script>
</body>
</html>`;

module.exports = async (req, res) => {
  const { url, method, headers } = req;
  const { pathname } = new URL(url, `http://${headers.host}`);

  let ip = headers["x-forwarded-for"] || req.connection.remoteAddress;
  if (ip) ip = ip.split(",")[0].trim();
  else ip = "Unknown";

  // Set cache control headers to prevent caching
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("X-Content-Type-Options", "nosniff");

  // IP Whitelist check
  if (!ALLOWED_IPS.includes(ip)) {
    res.statusCode = 403;
    res.setHeader("Content-Type", "text/html");
    return res.end(ACCESS_DENIED_HTML(ip));
  }

  let isAuthenticated = false;
  const cookieHeader = headers.cookie;
  if (cookieHeader && cookieHeader.includes(`password=${PASSWORD}`)) {
    isAuthenticated = true;
  }

  if (method === "POST") {
    let body = "";
    for await (const chunk of req) {
      body += chunk.toString();
    }
    const params = new URLSearchParams(body);
    const submittedPassword = params.get("password");

    if (submittedPassword === PASSWORD) {
      isAuthenticated = true;
      res.setHeader("Set-Cookie", `password=${PASSWORD}; Path=/; Max-Age=3600; HttpOnly; Secure`); // Cookie sécurisé pour 1 heure
      res.setHeader("Content-Type", "text/plain");
      return res.end(LUA_SCRIPT_CONTENT);
    } else {
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/html");
      return res.end(LOGIN_HTML(ip, "Incorrect password. Please try again."));
    }
  }

  if (isAuthenticated) {
    res.setHeader("Content-Type", "text/plain");
    return res.end(LUA_SCRIPT_CONTENT);
  } else {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html");
    return res.end(LOGIN_HTML(ip));
  }
};`))
