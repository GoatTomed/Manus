const ALLOWED_IPS = ["24.49.252.230"];
const PASSWORD = "Tocson123";

// Votre script LUA encodé en Base64 pour éviter tout crash
const LUA_SCRIPT_BASE64 = "LS1bWyBZb3VTdWNrIOKAlCBLZXkgU3lzdGVtIF1dDQpsb2NhbCBQbGF5ZXJzID0gZ2FtZTpHZXRTZXJ2aWNlKCJQbGF5ZXJzIikNCmxvY2FsIFR3ZWVuU2VydmljZSA9IGdhbWU6R2V0U2VydmljZSgiVHdlZW5TZXJ2aWNlIikNCmxvY2FsIFJ1blNlcnZpY2UgPSBnYW1lOkdldFNlcnZpY2UoIlJ1blNlcnZpY2UiKQ0KbG9jYWwgSHR0cFNlcnZpY2UgPSBnYW1lOkdldFNlcnZpY2UoIkh0dHBTZXJ2aWNlIikNCmxvY2FsIFN0YXJ0ZXJHdWkgPSBnYW1lOkdldFNlcnZpY2UoIlN0YXJ0ZXJHdWkiKQ0KbG9jYWwgUGxheWVyID0gUGxheWVycy5Mb2NhbFBsYXllcg0KbG9jYWwgcmVxdWVzdCA9IChzeW4gYW5kIHN5bi5yZXF1ZXN0KSBvciAoaHR0cCBhbmQgaHR0cC5yZXF1ZXN0KSBvciBodHRwX3JlcXVlc3Qgb3IgKGZsdXh1cyBhbmQgZmx1eHVzLnJlcXVlc3QpIG9yIHJlcXVlc3QNCmlmIG5vdCByZXF1ZXN0IHRoZW4gcmVxdWVzdCA9IGZ1bmN0aW9uKG8pIHJldHVybiBIdHRwU2VydmljZTpSZXF1ZXN0QXN5bmMobykgZW5kIGVuZA0KDQpsb2NhbCBBUElfVVJMID0gImh0dHBzOi8veW91cnN1Y2sudmVyY2VsLmFwcC9hcGkvdmVyaWZ5LWtleSINCg0KLS0gUEFMRVRURQ0KbG9jYWwgQyA9IHsNCglCRyA9IENvbG9yMy5mcm9tUkdCKDEwLCAxMCwgMTApLA0KCVN1cmZhY2UgPSBDb2xvcjMuZnJvbVJHQigxNSwgMTUsIDE1KSwNCglSYWlzZWQgPSBDb2xvcjMuZnJvbVJHQigyMiwgMjIsIDIyKSwNCglCb3JkZXIgPSBDb2xvcjMuZnJvbVJHQigzOCwgMzgsIDM4KSwNCglQcmltYXJ5ID0gQ29sb3IzLmZyb21SR0IoMSwgMTY4LCAyMjUpLA0KCVByaW1hcnlMbz0gQ29sb3IzLmZyb21SR0IoMSwgMTM0LCAxODEpLA0KCVRleHQgPSBDb2xvcjMuZnJvbVJHQigyNDAsIDI0MCwgMjQwKSwNCglUZXh0TWlkID0gQ29sb3IzLmZyb21SR0IoMTUwLCAxNTAsIDE1MCksDQoJVGV4dExvdyA9IENvbG9yMy5mcm9tUkdCKDc1LCA3NSwgNzUpLA0KCVN1Y2Nlc3MgPSBDb2xvcjMuZnJvbVJHQigzNCwgMTk3LCA5NCksDQoJRXJyb3IgPSBDb2xvcjMuZnJvbVJHQigyMzksIDY4LCA2OCksDQoJV2hpdGUgPSBDb2xvcjMubmV3KDEsIDEsIDEpLA0KfQ0KDQotLSBIRUxQRVJTDQpsb2NhbCBmdW5jdGlvbiB0dyhvYmosIGdvYWwsIHQsIHN0eWxlLCBkaXIpDQoJVHdlZW5TZXJ2aWNlOkNyZWF0ZShvYmosIFR3ZWVuSW5mby5uZXcodCBvciAwLjE4LCBzdHlsZSBvciBFbnVtLkVhc2luZ1N0eWxlLlF1YXJ0LCBkaXIgb3IgRW51bS5FYXNpbmdEaXJlY3Rpb24uT3V0KSwgZ29hbCk6UGxheSgpDQplbmQNCmxvY2FsIGZ1bmN0aW9uIGNvcm5lcihwLCByKSBsb2NhbCBjID0gSW5zdGFuY2UubmV3KCJVSUNvcm5lciIsIHApIGMuQ29ybmVyUmFkaXVzID0gVURpbS5uZXcoMCwgciBvciA2KSByZXR1cm4gYyBlbmQNCmxvY2FsIGZ1bmN0aW9uIHN0cm9rZShwLCBjb2wsIHRoaWNrKSBsb2NhbCBzID0gSW5zdGFuY2UubmV3KCJVSVN0cm9rZSIsIHApIHMuQ29sb3IgPSBjb2wgb3IgQy5Cb3JkZXIgcy5UaGlja25lc3MgPSB0aGljayBvciAxIHJldHVybiBzIGVuZA0KbG9jYWwgZnVuY3Rpb24gcGFkKHAsIGwsIHIsIHQsIGIpDQoJbG9jYWwgdSA9IEluc3RhbmNlLm5ldygiVUlQYWRkaW5nIiwgcCkNCgl1LlBhZGRpbmdMZWZ0ID0gVURpbS5uZXcoMCwgbCBvciAwKQ0KCXUuUGFkZGluZ1JpZ2h0ID0gVURpbS5uZXcoMCwgciBvciAwKQ0KCXUuUGFkZGluZ1RvcCA9IFVEaW0ubmV3KDAsIHQgb3IgMCkNCgl1LlBhZGRpbmdCb3R0b20gPSBVRGltLm5ldygwLCBiIG9yIDApDQplbmQNCmxvY2FsIGZ1bmN0aW9uIGxibChwYXJlbnQsIHByb3BzKQ0KCWxvY2FsIGwgPSBJbnN0YW5jZS5uZXcoIlRleHRMYWJlbCIsIHBhcmVudCkNCglsLkJhY2tncm91bmRUcmFuc3BhcmVuY3kgPSAxDQoJbC5Cb3JkZXJTaXplUGl4ZWwgPSAwDQoJbC5SaWNoVGV4dCA9IHRydWUNCglmb3IgaywgdiBpbiBwYWlycyhwcm9wcykgZG8gbFtrXSA9IHYgZW5kDQoJcmV0dXJuIGwNCmVuZA0KbG9jYWwgZnVuY3Rpb24gZnJtKHBhcmVudCwgcHJvcHMpDQoJbG9jYWwgZiA9IEluc3RhbmNlLm5ldygiRnJhbWUiLCBwYXJlbnQpDQoJZi5Cb3JkZXJTaXplUGl4ZWwgPSAwDQoJZm9yIGssIHYgaW4gcGFpcnMocHJvcHMpIGRvIGZba10gPSB2IGVuZA0KCXJldHVybiBmDQplbmQNCmxvY2FsIGZ1bmN0aW9uIG1ha2VEcmFnZ2FibGUocm9vdCwgaGFuZGxlKQ0KCWhhbmRsZSA9IGhhbmRsZSBvciByb290DQoJbG9jYWwgZHJhZywgZHN0YXJ0LCBvcG9zDQoJaGFuZGxlLklucHV0QmVnYW46Q29ubmVjdChmdW5jdGlvbihpKQ0KCQlpZiBpLlVzZXJJbnB1dFR5cGUgPT0gRW51bS5Vc2VySW5wdXRUeXBlLk1vdXNlQnV0dG9uMSBvciBpLlVzZXJJbnB1dFR5cGUgPT0gRW51bS5Vc2VySW5wdXRUeXBlLlRvdWNoIHRoZW4NCgkJCWRyYWcgPSB0cnVlOyBkc3RhcnQgPSBpLlBvc2l0aW9uOyBvcG9zID0gcm9vdC5Qb3NpdGlvbg0KCQkJaS5DaGFuZ2VkOkNvbm5lY3QoZnVuY3Rpb24oKSBpZiBpLlVzZXJJbnB1dFN0YXRlID09IEVudW0uVXNlcklucHV0U3RhdGUuRW5kIHRoZW4gZHJhZyA9IGZhbHNlIGVuZCBlbmQpDQoJCWVuZA0KCWVuZCkNCgloYW5kbGUuSW5wdXRDaGFuZ2VkOkNvbm5lY3QoZnVuY3Rpb24oaSkNCgkJaWYgZHJhZyBhbmQgKGkuVXNlcklucHV0VHlwZSA9PSBFbnVtLlVzZXJJbnB1dFR5cGUuTW91c2VNb3ZlbWVudCBvciBpLlVzZXJJbnB1dFR5cGUgPT0gRW51bS5Vc2VySW5wdXRUeXBlLlRvdWNoKSB0aGVuDQoJCQlsb2NhbCBkID0gaS5Qb3NpdGlvbiAtIGRzdGFydA0KCQkJcm9vdC5Qb3NpdGlvbiA9IFVEaW0yLm5ldyhvcG9zLlguU2NhbGUsIG9wb3MuWC5PZmZzZXQgKyBkLlgsIG9wb3MuWS5TY2FsZSwgb3Bvcy5ZLk9mZnNldCArIGQuWSkNCgkJZW5kDQoJZW5kKQ0KZW5kDQoNCi0tIEdVSQ0KbG9jYWwgR3VpID0gSW5zdGFuY2UubmV3KCJTY3JlZW5HdWkiKQ0KR3VpLk5hbWUgPSAiS2V5U3lzdGVtIg0KR3VpLlJlc2V0T25TcGF3biA9IGZhbHNlDQpHdWkuSWdub3JlR3VpSW5zZXQgPSB0cnVlDQpHdWkuRGlzcGxheU9yZGVyID0gOTk5DQpHdWkuUGFyZW50ID0gUGxheWVyOldhaXRGb3JDaGlsZCgiUGxheWVyR3VpIikNCg0KbG9jYWwgU2NyaW0gPSBmcm0oR3VpLCB7DQoJU2l6ZSA9IFVEaW0yLm5ldygxLDAsMSwwKSwNCglCYWNrZ3JvdW5kQ29sb3IzID0gQ29sb3IzLm5ldygwLDAsMCksDQoJQmFja2dyb3VuZFRyYW5zcGFyZW5jeSA9IDEsDQoJWkluZGV4ID0gMSwNCn0pDQp0dyhTY3JpbSwge0JhY2tncm91bmRUcmFuc3BhcmVuY3kgPSAwLjZ9LCAwLjQpDQoNCi0tIENBUkQNCmxvY2FsIFcsIEggPSA0MDAsIDI5MA0KbG9jYWwgQ2FyZCA9IGZybShHdWksIHsNCglTaXplID0gVURpbTIubmV3KDAsIFcsIDAsIEgpLA0KCVBvc2l0aW9uID0gVURpbTIubmV3KDAuNSwgLVcvMiwgMC41LCAtSC8yICsgMjQpLA0KCUJhY2tncm91bmRDb2xvcjMgPSBDLlN1cmZhY2UsDQoJQmFja2dyb3VuZFRyYW5zcGFyZW5jeSA9IDEsDQoJWkluZGV4ID0gMiwNCn0pDQpjb3JuZXIoQ2FyZCwgMTApDQpzdHJva2UoQ2FyZCwgQy5Cb3JkZXIsIDEpDQp0dyhDYXJkLCB7QmFja2dyb3VuZFRyYW5zcGFyZW5jeSA9IDAsIFBvc2l0aW9uID0gVURpbTIubmV3KDAuNSwtVy8yLDAuNSwtSC8yKX0sIDAuNCwgRW51bS5FYXNpbmdTdHlsZS5RdWFydCkNCg0KLS0gVElUTEVCQVINCmxvY2FsIFRCYXIgPSBmcm0oQ2FyZCwgew0KCVNpemUgPSBVRGltMi5uZXcoMSwgMCwgMCwgNDApLA0KCUJhY2tncm91bmRDb2xvcjMgPSBDb2xvcjMuZnJvbVJHQigxNCwgMTQsIDE0KSwNCglaSW5kZXggPSAzLA0KfSkNCmNvcm5lcihUQmFyLCAxMCkNCmZybShUQmFyLCB7DQoJU2l6ZSA9IFVEaW0yLm5ldygxLCAwLCAwLCAxMCksDQoJUG9zaXRpb24gPSBVRGltMi5uZXcoMCwgMCwgMSwgLTEwKSwNCglCYWNrZ3JvdW5kQ29sb3IzID0gQ29sb3IzLmZyb21SR0IoMTQsIDE0LCAxNCksDQp9KQ0KZnJtKENhcmQsIHsNCglTaXplID0gVURpbTIubmV3KDEsIDAsIDAsIDEpLA0KCVBvc2l0aW9uID0gVURpbTIubmV3KDAsIDAsIDAsIDQwKSwNCglCYWNrZ3JvdW5kQ29sb3IzID0gQy5Cb3JkZXIsDQoJWkluZGV4ID0gMywNCn0pDQptYWtlRHJhZ2dhYmxlKENhcmQsIFRCYXIpDQpsYmwoVEJhciwgew0KCVNpemUgPSBVRGltMi5uZXcoMCwgMTIwLCAxLCAwKSwNCglQb3NpdGlvbiA9IFVEaW0yLm5ldygwLCAxMiwgMCwgMCksDQoJVGV4dCA9ICIgIiwNCglUZXh0Q29sb3IzID0gQy5UZXh0LA0KCVRleHRTaXplID0gMjAsDQoJRm9udCA9IEVudW0uRm9udC5Hb3RoYW0sDQoJVGV4dFhBbGlnbm1lbnQgPSBFbnVtLlRleHRYQWxpZ25tZW50LkxlZnQsDQoJWkluZGV4ID0gNCwNCn0pDQpsb2NhbCBDbG9zZUJ0biA9IEluc3RhbmNlLm5ldygiVGV4dEJ1dHRvbiIsIFRCYXIpDQpDbG9zZUJ0bi5TaXplID0gVURpbTIubmV3KDAsIDI4LCAxLCAwKQ0KQ2xvc2VCdG4uUG9zaXRpb24gPSBVRGltMi5uZXcoMSwgLTMwLCAwLCAwKQ0KQ2xvc2VCdG4uQmFja2dyb3VuZFRyYW5zcGFyZW5jeSA9IDENCkNsb3NlQnRuLlRleHQgPSAiWCINCkNsb3NlQnRuLlRleHRDb2xvcjMgPSBDb2xvcjMuZnJvbVJHQigxODAsIDE4MCwgMTgwKQ0KQ2xvc2VCdG4uRm9udCA9IEVudW0uRm9udC5Hb3RoYW0NCkNsb3NlQnRuLlRleHRTaXplID0gMTMNCkNsb3NlQnRuLlpJbmRleCA9IDUNCkNsb3NlQnRuLk1vdXNlRW50ZXI6Q29ubmVjdChmdW5jdGlvbigpIHR3KENsb3NlQnRuLHtUZXh0Q29sb3IzPUMuV2hpdGV9LDAuMSkgZW5kKQ0KQ2xvc2VCdG4uTW91c2VMZWF2ZTpDb25uZWN0KGZ1bmN0aW9uKCkgdHcoQ2xvc2VCdG4se1RleHRDb2xvcjM9Q29sb3IzLmZyb21SR0IoMTgwLDE4MCwxODApfSwwLjEpIGVuZCkNCkNsb3NlQnRuLk1vdXNlQnV0dG9uMUNsaWNrOkNvbm5lY3QoZnVuY3Rpb24oKQ0KCXR3KENhcmQsIHtCYWNrZ3JvdW5kVHJhbnNwYXJlbmN5PTEsIFBvc2l0aW9uPVVEaW0yLm5ldygwLjUsLVcvMiwwLjUsLUgvMisxOCl9LCAwLjI1KQ0KCXR3KFNjcmltLCB7QmFja2dyb3VuZFRyYW5zcGFyZW5jeT0xfSwgMC4yNSkNCgl0YXNrLmRlbGF5KDAuMywgZnVuY3Rpb24oKSBHdWk6RGVzdHJveSgpIGVuZCkNCmVuZCkNCg0KLS0gQk9EWQ0KbG9jYWwgQm9keSA9IGZybShDYXJkLCB7DQoJU2l6ZSA9IFVEaW0yLm5ldygxLCAwLCAxLCAtNDEpLA0KCVBvc2l0aW9uID0gVURpbTIubmV3KDAsIDAsIDAsIDQxKSwNCglCYWNrZ3JvdW5kVHJhbnNwYXJlbmN5ID0gMSwNCglaSW5kZXggPSAzLA0KfSkNCnBhZChCb2R5LCAyMiwgMjIsIDAsIDApDQoNCmxvY2FsIFRpdGxlID0gbGJsKEJvZHksIHsNCglTaXplID0gVURpbTIubmV3KDEsIDAsIDAsIDI2KSwNCglQb3NpdGlvbiA9IFVEaW0yLm5ldygwLCAwLCAwLCAxNiksDQoJVGV4dENvbG9yMyA9IEMuVGV4dCwNCglUZXh0U2l6ZSA9IDI4LA0KCUZvbnQgPSBFbnVtLkZvbnQuR290aGFtQm9sZCwNCglUZXh0WEFsaWdubWVudCA9IEVudW0uVGV4dFhBbGlnbm1lbnQuTGVmdCwNCglaSW5kZXggPSA0LA0KfSkNClRpdGxlLlJpY2hUZXh0ID0gdHJ1ZQ0KVGl0bGUuVGV4dCA9ICcgICAgICAgICAgICAgICAgICA8Zm9udCBjb2xvcj0iI0ZGRkZGRiI+WW91PC9mb250Pjxmb250IGNvbG9yPSIjMDBBQkZGIj5TdWNrPC9mb250PicNCg0KbGJsKEJvZHksIHsNCglTaXplID0gVURpbTIubmV3KDEsIDAsIDAsIDE0KSwNCglQb3NpdGlvbiA9IFVEaW0yLm5ldygwLCAwLCAwLCA0NCksDQoJVGV4dCA9ICIgIiwNCglUZXh0Q29sb3IzID0gQy5UZXh0TWlkLA0KCVRleHRTaXplID0gMTEsDQoJRm9udCA9IEVudW0uRm9udC5Hb3RoYW0sDQoJVGV4dFhBbGlnbm1lbnQgPSBFbnVtLlRleHRYQWxpZ25tZW50LkxlZnQsDQoJWkluZGV4ID0gNCwNCn0pDQoNCi0tIElOUFVUDQpsb2NhbCBJbnB1dFdyYXAgPSBmcm0oQm9keSwgew0KCVNpemUgPSBVRGltMi5uZXcoMSwgMCwgMCwgNDIpLA0KCVBvc2l0aW9uID0gVURpbTIubmV3KDAsIDAsIDAsIDcwKSwNCglCYWNrZ3JvdW5kQ29sb3IzID0gQy5SYWlzZWQsDQoJWkluZGV4ID0gNCwNCn0pDQpjb3JuZXIoSW5wdXRXcmFwLCA3KQ0KbG9jYWwgSW5wdXRTdHJva2UgPSBzdHJva2UoSW5wdXRXcmFwLCBDLkJvcmRlciwgMSkNCmxvY2FsIElucHV0ID0gSW5zdGFuY2UubmV3KCJUZXh0Qm94IiwgSW5wdXRXcmFwKQ0KSW5wdXQuU2l6ZSA9IFVEaW0yLm5ldygxLCAwLCAxLCAwKQ0KSW5wdXQuQmFja2dyb3VuZFRyYW5zcGFyZW5jeSA9IDENCklucHV0LlRleHQgPSAiIg0KSW5wdXQuUGxhY2Vob2xkZXJUZXh0ID0gIlBhc3RlIEtleSBIZXJlIg0KSW5wdXQuVGV4dENvbG9yMyA9IEMuVGV4dA0KSW5wdXQuUGxhY2Vob2xkZXJDb2xvcjMgPSBDLlRleHRMb3cNCklucHV0LkZvbnQgPSBFbnVtLkZvbnQuR290aGFtDQpJbnB1dC5UZXh0U2l6ZSA9IDEyDQpJbnB1dC5DbGVhclRleHRPbkZvY3VzID0gZmFsc2UNCklucHV0LlpJbmRleCA9IDUNCnBhZChJbnB1dCwgMTQsIDE0LCAwLCAwKQ0KSW5wdXQuRm9jdXNlZDpDb25uZWN0KGZ1bmN0aW9uKCkNCgl0dyhJbnB1dFN0cm9rZSwge0NvbG9yID0gQy5QcmltYXJ5LCBUcmFuc3BhcmVuY3kgPSAwLjM1fSkNCgl0dyhJbnB1dFdyYXAsIHtCYWNrZ3JvdW5kQ29sb3IzID0gQ29sb3IzLmZyb21SR0IoMTIsMjQsMzIpfSkNCmVuZCkNCklucHV0LkZvY3VzTG9zdDpDb25uZWN0KGZ1bmN0aW9uKCkNCgl0dyhJbnB1dFN0cm9rZSwge0NvbG9yID0gQy5Cb3JkZXIsIFRyYW5zcGFyZW5jeSA9IDB9KQ0KCXR3KElucHV0V3JhcCwge0JhY2tncm91bmRDb2xvcjMgPSBDLlJhaXNlZH0pDQplbmQpDQoNCi0tIFNUQVRVUw0KbG9jYWwgU3RhdHVzUm93ID0gZnJtKEJvZHksIHsNCglTaXplID0gVURpbTIubmV3KDEsIDAsIDAsIDE4KSwNCglQb3NpdGlvbiA9IFVEaW0yLm5ldygwLCAwLCAwLCAxNzgpLA0KCUJhY2tncm91bmRUcmFuc3BhcmVuY3kgPSAxLA0KCVpJbmRleCA9IDQsDQp9KQ0KbG9jYWwgU0RvdCA9IGZybShTdGF0dXNSb3csIHsNCglTaXplID0gVURpbTIubmV3KDAsIDYsIDAsIDYpLA0KCVBvc2l0aW9uID0gVURpbTIubmV3KDAsIDAsIDAuNSwgLTMpLA0KCUJhY2tncm91bmRDb2xvcjMgPSBDLlRleHRMb3csDQoJWkluZGV4ID0gNSwNCn0pDQpjb3JuZXIoU0RvdCwgMykNCmxvY2FsIFNMYmwgPSBsYmwoU3RhdHVzUm93LCB7DQoJU2l6ZSA9IFVEaW0yLm5ldygxLCAtMTIsIDEsIDApLA0KCVBvc2l0aW9uID0gVURpbTIubmV3KDAsIDEyLCAwLCAwKSwNCglUZXh0ID0gIkF3YWl0aW5nIGlucHV0IiwNCglUZXh0Q29sb3IzID0gQy5UZXh0TG93LA0KCVRleHRTaXplID0gMTEsDQoJRm9udCA9IEVudW0uRm9udC5Hb3RoYW0sDQoJVGV4dFhBbGlnbm1lbnQgPSBFbnVtLlRleHRYQWxpZ25tZW50LkxlZnQsDQoJWkluZGV4ID0gNSwNCn0pDQoNCmxvY2FsIGZ1bmN0aW9uIHNldFN0YXR1cyhtc2csIGNvbCwgZG90Q29sKQ0KCVNMYmwuVGV4dCA9IG1zZw0KCVNMYmwuVGV4dENvbG9yMyA9IGNvbCBvciBDLlRleHRMb3cNCgl0dyhTRG90LCB7QmFja2dyb3VuZENvbG9yMyA9IGRvdENvbCBvciBDLlRleHRMb3d9LCAwLjE1KQ0KZW5kDQoNCi0tIEZPT1RFUg0KbG9jYWwgRm9vdGVyID0gZnJtKEJvZHksIHsNCglTaXplID0gVURpbTIubmV3KDEsIDAsIDAsIDM0KSwNCglQb3NpdGlvbiA9IFVEaW0yLm5ldygwLCAwLCAxLCAtMzQpLA0KCUJhY2tncm91bmRUcmFuc3BhcmVuY3kgPSAxLA0KCVpJbmRleCA9IDQsDQp9KQ0KZnJtKEZvb3Rlciwge1NpemU9VURpbTIubmV3KDEsMCwwLDEpLCBCYWNrZ3JvdW5kQ29sb3IzPUMuQm9yZGVyfSkNCmxibChGb290ZXIsIHsNCglTaXplPVVEaW0yLm5ldygwLjUsMCwxLDApLA0KCVBvc2l0aW9uPVVEaW0yLm5ldygwLDAsMCwwKSwNCglUZXh0PSIiLA0KCVRleHRDb2xvcjM9Qy5UZXh0TG93LA0KCVRleHRTaXplPTEwLA0KCUZvbnQ9RW51bS5Gb250LkdvdGhhbSwNCglUZXh0WEFsaWdubWVudD1FbnVtLlRleHRYQWxpZ25tZW50LkxlZnQsDQoJWkluZGV4PTUsDQp9KQ0KDQotLSBUT0FTVCAobW92ZWQgdXAgc28gYnV0dG9ucyBjYW4gdXNlIGl0KQ0KbG9jYWwgZnVuY3Rpb24gdG9hc3QobXNnLCBjb2wsIGR1cmF0aW9uKQ0KCWNvbCA9IGNvbCBvciBDLlByaW1hcnk7IGR1cmF0aW9uID0gZHVyYXRpb24gb3IgMw0KCWxvY2FsIFQgPSBmcm0oR3VpLCB7DQoJCVNpemU9VURpbTIubmV3KDAsMjYwLDAsNDQpLA0KCQlQb3NpdGlvbj1VRGltMi5uZXcoMC41LC0xMzAsMSwxMCksDQoJCUJhY2tncm91bmRDb2xvcjM9Qy5TdXJmYWNlLA0KCQlaSW5kZXg9MjAsDQoJfSkNCgljb3JuZXIoVCwgOCk7IHN0cm9rZShULCBjb2wsIDEpDQoJbG9jYWwgQWNjID0gZnJtKFQsIHtTaXplPVVEaW0yLm5ldygwLDMsMSwtMTYpLCBQb3NpdGlvbj1VRGltMi5uZXcoMCw3LDAsOCksIEJhY2tncm91bmRDb2xvcjM9Y29sLCBaSW5kZXg9MjF9KQ0KCWNvcm5lcihBY2MsIDIpDQoJbGJsKFQsIHtTaXplPVVEaW0yLm5ldygxLC0yMiwxLDApLCBQb3NpdGlvbj1VRGltMi5uZXcoMCwxOCwwLDApLCBUZXh0PW1zZywgVGV4dENvbG9yMz1DLlRleHQsIFRleHRTaXplPTEyLCBGb250PUVudW0uRm9udC5Hb3RoYW1Cb2xkLCBUZXh0WEFsaWdubWVudD1FbnVtLlRleHRYQWxpZ25tZW50LkxlZnQsIFpJbmRleD0yMn0pDQoJdHcoVCwge1Bvc2l0aW9uPVVEaW0yLm5ldygwLjUsLTEzMCwxLC01NCl9LCAwLjM1LCBFbnVtLkVhc2luZ1N0eWxlLkJhY2spDQoJdGFzay5kZWxheShkdXJhdGlvbiwgZnVuY3Rpb24oKQ0KCQl0dyhULCB7UG9zaXRpb249VURpbTIubmV3KDAuNSwtMTMwLDEsMTApLCBCYWNrZ3JvdW5kVHJhbnNwYXJlbmN5PTF9LCAwLjMpDQoJCXRhc2suZGVsYXkoMC4zNSwgZnVuY3Rpb24oKSBUOkRlc3Ryb3koKSBlbmQpDQoJZW5kKQ0KZW5kDQoNCi0tIEJVVFRPTlMgUk9XDQpsb2NhbCBCdG5Sb3cgPSBmcm0oQm9keSwgew0KCVNpemUgPSBVRGltMi5uZXcoMSwgMCwgMCwgNDIpLA0KCVBvc2l0aW9uID0gVURpbTIubmV3KDAsIDAsIDAsIDEyNCksDQoJQmFja2dyb3VuZFRyYW5zcGFyZW5jeSA9IDEsDQoJWkluZGV4ID0gNCwNCn0pDQoNCi0tIEdFVCBLRVkgYnV0dG9uIChsZWZ0IGhhbGYpDQpsb2NhbCBHZXRLZXlXcmFwID0gZnJtKEJ0blJvdywgew0KCVNpemUgPSBVRGltMi5uZXcoMC40OCwgMCwgMSwgMCksDQoJUG9zaXRpb24gPSBVRGltMi5uZXcoMCwgMCwgMCwgMCksDQoJQmFja2dyb3VuZENvbG9yMyA9IEMuUHJpbWFyeSwNCglaSW5kZXggPSA0LA0KfSkNCmNvcm5lcihHZXRLZXlXcmFwLCA3KQ0KbG9jYWwgR2V0S2V5QnRuID0gSW5zdGFuY2UubmV3KCJUZXh0QnV0dG9uIiwgR2V0S2V5V3JhcCkNCkdldEtleUJ0bi5TaXplID0gVURpbTIubmV3KDEsIDAsIDEsIDApDQpHZXRLZXlCdG4uQmFja2dyb3VuZFRyYW5zcGFyZW5jeSA9IDENCkdldEtleUJ0bi5UZXh0ID0gIkdldCBLZXkiDQpHZXRLZXlCdG4uVGV4dENvbG9yMyA9IEMuV2hpdGUNCkdldEtleUJ0bi5Gb250ID0gRW51bS5Gb250LkdvdGhhbUJvbGQNCkdldEtleUJ0bi5UZXh0U2l6ZSA9IDEzDQpHZXRLZXlCdG4uWkluZGV4ID0gNQ0KR2V0S2V5QnRuLk1vdXNlRW50ZXI6Q29ubmVjdChmdW5jdGlvbigpIHR3KEdldEtleVdyYXAsIHtCYWNrZ3JvdW5kQ29sb3IzID0gQ29sb3IzLmZyb21SR0IoMywxOTAsMjU1KX0pIGVuZCkNCkdldEtleUJ0bi5Nb3VzZUxlYXZlOkNvbm5lY3QoZnVuY3Rpb24oKSB0dyhHZXRLZXlXcmFwLCB7QmFja2dyb3VuZENvbG9yMyA9IEMuUHJpbWFyeX0pIGVuZCkNCkdldEtleUJ0bi5Nb3VzZUJ1dHRvbjFEb3duOkNvbm5lY3QoZnVuY3Rpb24oKSB0dyhHZXRLZXlXcmFwLCB7QmFja2dyb3VuZENvbG9yMyA9IEMuUHJpbWFyeUxvfSwgMC4wOCkgZW5kKQ0KR2V0S2V5QnRuLk1vdXNlQnV0dG9uMVVwOkNvbm5lY3QoZnVuY3Rpb24oKQ0KCXR3KEdldEtleVdyYXAsIHtCYWNrZ3JvdW5kQ29sb3IzID0gQy5QcmltYXJ5fSwgMC4xKQ0KCXNldGNsaXBib2FyZCgiaHR0cHM6Ly95b3Vyc3Vjay52ZXJjZWwuYXBwLyIpDQoJcGNhbGwoZnVuY3Rpb24oKQ0KCQlTdGFydGVyR3VpOlNldENvcmUoIlNlbmROb3RpZmljYXRpb24iLCB7DQoJCQlUaXRsZSA9ICJZb3VTdWNrIiwNCgkJCVRleHQgPSAiTGluayBjb3BpZWQgdG8gY2xpcGJvYXJkISIsDQoJCQlEdXJhdGlvbiA9IDMsDQoJCX0pDQoJZW5kKQ0KCXRvYXN0KCJMaW5rIGNvcGllZCB0byBjbGlwYm9hcmQhIiwgQy5QcmltYXJ5LCAyLjUpDQplbmQpDQoNCi0tIFZFUklGWSBLRVkgYnV0dG9uIChyaWdodCBoYWxmKQ0KbG9jYWwgQnRuV3JhcCA9IGZybShCdG5Sb3csIHsNCglTaXplID0gVURpbTIubmV3KDAuNDgsIDAsIDEsIDApLA0KCVBvc2l0aW9uID0gVURpbTIubmV3KDAuNTIsIDAsIDAsIDApLA0KCUJhY2tncm91bmRDb2xvcjMgPSBDLlByaW1hcnksDQoJWkluZGV4ID0gNCwNCn0pDQpjb3JuZXIoQnRuV3JhcCwgNykNCmxvY2FsIEJ0biA9IEluc3RhbmNlLm5ldygiVGV4dEJ1dHRvbiIsIEJ0bldyYXApDQpCdG4uU2l6ZSA9IFVEaW0yLm5ldygxLCAwLCAxLCAwKQ0KQnRuLkJhY2tncm91bmRUcmFuc3BhcmVuY3kgPSAxDQpCdG4uVGV4dCA9ICJWZXJpZnkgS2V5Ig0KQnRuLlRleHRDb2xvcjMgPSBDLldoaXRlDQpCdG4uRm9udCA9IEVudW0uRm9udC5Hb3RoYW1Cb2xkDQpCdG4uVGV4dFNpemUgPSAxMw0KQnRuLlpJbmRleCA9IDUNCkJ0bi5Nb3VzZUVudGVyOkNvbm5lY3QoZnVuY3Rpb24oKSB0dyhCdG5XcmFwLCB7QmFja2dyb3VuZENvbG9yMyA9IENvbG9yMy5mcm9tUkdCKDMsMTkwLDI1NSl9KSBlbmQpDQpCdG4uTW91c2VMZWF2ZTpDb25uZWN0KGZ1bmN0aW9uKCkgdHcoQnRuV3JhcCwge0JhY2tncm91bmRDb2xvcjMgPSBDLlByaW1hcnl9KSBlbmQpDQpCdG4uTW91c2VCdXR0b24xRG93bjpDb25uZWN0KGZ1bmN0aW9uKCkgdHcoQnRuV3JhcCwge0JhY2tncm91bmRDb2xvcjMgPSBDLlByaW1hcnlMb30sIDAuMDgpIGVuZCkNCkJ0bi5Nb3VzZUJ1dHRvbjFVcDpDb25uZWN0KGZ1bmN0aW9uKCkgdHcoQnRuV3JhcCwge0JhY2tncm91bmRDb2xvcjMgPSBDLlByaW1hcnl9LCAwLjEpIGVuZCkNCg0KLS0gU0VTU0lPTiBQSUxMICsgS0VZIElORk8NCmxvY2FsIGZ1bmN0aW9uIGlzb1RvVHMocykNCglpZiBub3QgcyBvciB0eXBlKHMpfj0ic3RyaW5nIiB0aGVuIHJldHVybiBvcy50aW1lKCkrODY0MDAgZW5kDQoJbG9jYWwgeSxtbyxkLGgsbWksc2MgPSBzOm1hdGNoKCIoJWQrKS0oJWQrKS0oJWQrKVQoJWQrKTooJWQrKTooJWQrKSIpDQoJaWYgbm90IHkgdGhlbiByZXR1cm4gb3MudGltZSgpKzg2NDAwIGVuZA0KCXJldHVybiBvcy50aW1lKHt5ZWFyPXksbW9udGg9bW8sZGF5PWQsaG91cj1oLG1pbj1taSxzZWM9c2N9KQ0KZW5kDQoNCmxvY2FsIGZ1bmN0aW9uIHNwYXduUGlsbChleHBpcmVzQXQpDQoJbG9jYWwgdHMgPSBpc29Ub1RzKGV4cGlyZXNBdCkNCg0KCWxvY2FsIFBpbGwgPSBmcm0oR3VpLCB7DQoJCVNpemU9VURpbTIubmV3KDAsMjIwLDAsMzYpLA0KCQlQb3NpdGlvbj1VRGltMi5uZXcoMSwtMjMwLDEsMTApLA0KCQlCYWNrZ3JvdW5kQ29sb3IzPUMuU3VyZmFjZSwNCgkJWkluZGV4PTE1LA0KCQlBY3RpdmU9dHJ1ZSwNCgl9KQ0KCWNvcm5lcihQaWxsLCAxOCk7IHN0cm9rZShQaWxsLCBDLkJvcmRlciwgMSk7IG1ha2VEcmFnZ2FibGUoUGlsbCkNCglsb2NhbCBQaWxsRG90ID0gZnJtKFBpbGwsIHsNCgkJU2l6ZT1VRGltMi5uZXcoMCw3LDAsNyksDQoJCVBvc2l0aW9uPVVEaW0yLm5ldygwLDEyLDAuNSwtMyksDQoJCUJhY2tncm91bmRDb2xvcjM9Qy5TdWNjZXNzLA0KCQlaSW5kZXg9MTYsDQoJfSkNCgljb3JuZXIoUGlsbERvdCwgNCkNCglsb2NhbCBQaWxsTGJsID0gbGJsKFBpbGwsIHsNCgkJU2l6ZT1VRGltMi5uZXcoMSwtMjgsMSwwKSwNCgkJUG9zaXRpb249VURpbTIubmV3KDAsMjQsMCwwKSwNCgkJVGV4dD0iU2Vzc2lvbiBhY3RpdmUiLA0KCQlUZXh0Q29sb3IzPUMuVGV4dE1pZCwNCgkJVGV4dFNpemU9MTEsDQoJCUZvbnQ9RW51bS5Gb250LkdvdGhhbUJvbGQsDQoJCVRleHRYQWxpZ25tZW50PUVudW0uVGV4dFhBbGlnbm1lbnQuTGVmdCwNCgkJWkluZGV4PTE2LA0KCX0pDQoJdHcoUGlsbCwge1Bvc2l0aW9uPVVEaW0yLm5ldygxLC0yMzAsMSwtNDYpfSwgMC40LCBFbnVtLkVhc2luZ1N0eWxlLkJhY2spDQoNCglsb2NhbCBJbmZvID0gZnJtKEd1aSwgew0KCQlTaXplPVVEaW0yLm5ldygwLDIyMCwwLDkwKSwNCgkJUG9zaXRpb249VURpbTIubmV3KDEsLTIzMCwxLDEwKSwNCgkJQmFja2dyb3VuZENvbG9yMz1DLlN1cmZhY2UsDQoJCVpJbmRleD0xNSwNCgkJQWN0aXZlPXRydWUsDQoJfSkNCgljb3JuZXIoSW5mbywgMTApOyBzdHJva2UoSW5mbywgQy5Cb3JkZXIsIDEpOyBtYWtlRHJhZ2dhYmxlKEluZm8pDQoNCglsb2NhbCBJbmZvQmFyID0gZnJtKEluZm8sIHsNCgkJU2l6ZT1VRGltMi5uZXcoMSwwLDAsMzApLA0KCQlQb3NpdGlvbj1VRGltMi5uZXcoMCwwLDAsMCksDQoJCUJhY2tncm91bmRDb2xvcjM9Q29sb3IzLmZyb21SR0IoMTQsMTQsMTQpLA0KCQlaSW5kZXg9MTYsDQoJfSkNCgljb3JuZXIoSW5mb0JhciwgMTApDQoJZnJtKEluZm9CYXIsIHtTaXplPVVEaW0yLm5ldygxLDAsMCwxMCksIFBvc2l0aW9uPVVEaW0yLm5ldygwLDAsMSwtMTApLCBCYWNrZ3JvdW5kQ29sb3IzPUNvbG9yMy5mcm9tUkdCKDE0LDE0LDE0KSwgWkluZGV4PTE2fSkNCglmcm0oSW5mbywge1NpemU9VURpbTIubmV3KDEsMCwwLDEpLCBQb3NpdGlvbj1VRGltMi5uZXcoMCwwLDAsMzApLCBCYWNrZ3JvdW5kQ29sb3IzPUMuQm9yZGVyLCBaSW5kZXg9MTZ9KQ0KCWxvY2FsIEtleUluZm9Eb3QgPSBmcm0oSW5mb0Jhciwge1NpemU9VURpbTIubmV3KDAsNywwLDcpLCBQb3NpdGlvbj1VRGltMi5uZXcoMCwxMCwwLjUsLTMpLCBCYWNrZ3JvdW5kQ29sb3IzPUMuUHJpbWFyeSwgWkluZGV4PTE3fSkNCgljb3JuZXIoS2V5SW5mb0RvdCwgNCkNCglsYmwoSW5mb0Jhciwge1NpemU9VURpbTIubmV3KDEsLTIzMCwxLDApLCBQb3NpdGlvbj1VRGltMi5uZXcoMCwyMiwwLDApLCBUZXh0PSJLZXkgSW5mbyIsIFRleHRDb2xvcjM9Qy5UZXh0LCBUZXh0U2l6ZT0xMiwgRm9udD1FbnVtLkZvbnQuR290aGFtQm9sZCwgVGV4dFhBbGlnbm1lbnQ9RW51bS5UZXh0WEFsaWdubWVudC5MZWZ0LCBaSW5kZXg9MTd9KQ0KDQoJbG9jYWwgZnVuY3Rpb24gaW5mb1JvdyhwYXJlbnQsIGljb24sIGxhYmVsLCB5UG9zKQ0KCQlsb2NhbCByb3cgPSBmcm0ocGFyZW50LCB7U2l6ZT1VRGltMi5uZXcoMSwtMjAsMCwxOCksIFBvc2l0aW9uPVVEaW0yLm5ldygwLDEwLDAseVBvcyksIEJhY2tncm91bmRUcmFuc3BhcmVuY3k9MSwgWkluZGV4PTE3fSkNCgkJbGJsKHJvdywge1NpemU9VURpbTIubmV3KDAsNjAsMSwwKSwgUG9zaXRpb249VURpbTIubmV3KDAsMCwwLDApLCBUZXh0PWljb24uLiIgIi4ubGFiZWwsIFRleHRDb2xvcjM9Qy5UZXh0TG93LCBUZXh0U2l6ZT0xMSwgRm9udD1FbnVtLkZvbnQuR290aGFtLCBUZXh0WEFsaWdubWVudD1FbnVtLlRleHRYQWxpZ25tZW50LkxlZnQsIFpJbmRleD0xN30pDQoJCWxvY2FsIHZhbCA9IGxibChyb3csIHtTaXplPVVEaW0yLm5ldygxLC02NCwxLDApLCBQb3NpdGlvbj1VRGltMi5uZXcoMCw2NCwwLDApLCBUZXh0PSLigJQiLCBUZXh0Q29sb3IzPUMuVGV4dE1pZCwgVGV4dFNpemU9MTEsIEZvbnQ9RW51bS5Gb250LkdvdGhhbUJvbGQsIFRleHRYQWxpZ25tZW50PXBFbnVtLlRleHRYQWxpZ25tZW50LkxlZnQsIFpJbmRleD0xN30pDQoJCXJldHVybiB2YWwNCgllbmQNCg0KCWxvY2FsIFRpbWVWYWwgPSBpbmZvUm93KEluZm8sICIiLCAiRXhwaXJlcyIsIDM4KQ0KCWxvY2FsIFVzZXJWYWwgPSBpbmZvUm93KEluZm8sICIiLCAiVXNlciIsIDYwKQ0KCVVzZXJWYWwgLlRleHQgPSBQbGF5ZXIuTmFtZQ0KCXR3KEluZm8sIHtQb3NpdGlvbj1VRGltMi5uZXcoMSwtMjMwLDEsLTE0Nil9LCAwLjQsIEVudW0uRWFzaW5nU3R5bGUuQmFjaykNCg0KCWxvY2FsIGNvbm4NCgljb25uID0gUnVuU2VydmljZS5IZWFydGJlYXQ6Q29ubmVjdChmdW5jdGlvbigp\nCQlpZiBub3QgUGlsbC5QYXJlbnQgdGhlbiBjb25uOkRpc2Nvbm5lY3QoKSByZXR1cm4gZW5kDQoJCWxvY2FsIGxlZnQgPSB0cyAtIG9zLnRpbWUoKQ0KCQlpZiBsZWZ0IDw9IDAgdGhlbiA6IFBpbGxMYmwuVGV4dCA9ICJTZXNzaW9uIGV4cGlyZWQiIDogUGlsbExibC5UZXh0Q29sb3IzID0gQy5FcnJvciA6IFBpbGxEb3QuQmFja2dyb3VuZENvbG9yMyA9IEMuRXJyb3IgOiBUaW1lVmFsLlRleHQgPSAiRXhwaXJlZCIgOiBUaW1lVmFsLlRleHRDb2xvcjMgPSBDLkVycm9yIGVuZA0KCWVuZCkNCmVuZA0K"

const LOGIN_HTML = (detectedIp, errorMessage = "") => `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Connexion Sécurisée</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { background-color: #0a0a0a; color: #f0f0f0; font-family: 'Gotham', sans-serif; }
        .accent-blue { color: #22d3ee; }
        .bg-accent-blue { background-color: #22d3ee; }
        .input-field { background-color: #161616; border: 1px solid #262626; }
        .input-field:focus { border-color: #22d3ee; outline: none; }
    </style>
</head>
<body class="min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-#0f0f0f border border-#262626 p-8 rounded-lg shadow-2xl">
        <h1 class="text-2xl font-bold mb-2 text-center">You<span class="accent-blue">Suck</span></h1>
        <p class="text-sl text-gray-500 mb-6 text-center">Accès Protégé</p>
        <form method="POST" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">Mot de passe</label>
                <input type="password" name="password" required class="w-full input-field p-3 rounded-md text-white" placeholder="Entrez le mot de passe...">
            </div>
            <div class="text-xs text-gray-500 flex justify-between">
                <span>IP Détectée : ${detectedIp}</span>
            </div>
            ${errorMessage ? `<div class="text-red-500 text-xs mt-2">${errorMessage}</div>` : ""}
            <button type="submit" class="w-full bg-accent-blue text-black font-bold py-3 rounded-md hover:bg-cyan-400 transition-colors">Débloquer le script</button>
        </form>
    </div>
</body>
</html>`;

const ACCESS_DENIED_HTML = (detectedIp) => `<html lang="en" data-theme="light" style="--font-family: 'Inter', sans-serif; --border-radius: 6px; --white: #ffffff; --dark: #030625; --blue-primary: #225aea; --blue-depressed: #1448cb; --blue-light: #f2f6ff; --blue-dark: #000e58; --red-primary: #22d3ee; --red-depressed: #1448cb; --green-primary: #16895a; --yellow-primary: #f6b60e; --neutral-100: #f2f3f8; --neutral-200: #e2e6f3; --neutral-300: #c5cce3; --neutral-400: #a1aac8; --neutral-500: #707ba0; --neutral-600: #434c69; --neutral-700: #2b3450; --neutral-800: #151e3a; --neutral-900: #030625; --white-85-to-neutral-dark-50-85: rgba(255, 255, 255, 0.85); --color-white-to-dark: #ffffff; --white-to-neutral-dark-50: #ffffff; --color-dark-to-white: #030625; --color-dark-to-dark-50: #030625; --default-border-color: #f2f3f8; --fill-color: #707ba0; --menu-fill: #151e3a; --theme-switcher-text-color-default: #707ba0; --theme-switcher-text-color-active: #ffffff; --theme-switcher-border-color: #f2f3f8; --user-background-color: #ffffff; --notif-background-color: #ffffff; --notif-border-color: #f2f3f8; --notif-gradient-bottom: linear-gradient(360deg, #fff 15%, rgba(255, 255, 255, 0) 100%); --notif-gradient-top: linear-gradient(360deg, #fff 15%, rgba(255, 255, 255, 0) 100%); --notif-header-text: #151e3a; --notif-fill-color: #707ba0; --notif-empty-text-color: #a1aac8; --notif-empty-icon-color: #a1aac8; --notif-item-text-color: #151e3a; --notif-item-time-text-color: #c5cce3; --notif-item-border-color: #f2f3f8; --sidebar-fill-outline: #707ba0; --sidebar-fill-bold: #225aea; --sidebar-link-bgc: #f2f6ff; --sidebar-link: #707ba0; --sidebar-link-active: #225aea; --sidebar-sticky-bgc: #ffffff; --sidebar-sticky-brc: #f2f3f8; --tab-text-bgc: #f2f3f8; --tab-text-color: #c5cce3; --tab-bgc: #ffffff; --tab-no-active-bgc: #f2f3f8; --tab-no-active-brc: #f2f3f8; --tab-no-active-text-color: #c5cce3; --tab-red-bgc: #fff4f4; --tab-yellow-bgc: #fff9e8; --tab-pink-bgc: #fff9fc; --tab-purple-bgc: #f6f0ff; --tab-green-bgc: #e7fff1; --tab-brown-bgc: #fff6ee; --tab-red-brc: #fff4f4; --tab-yellow-brc: #fff9e8; --tab-pink-brc: #ffdeee; --tab-purple-brc: #f6f0ff; --tab-green-brc: #e7fff1; --tab-brown-brc: #f1d5ba; --category-text-color: #151e3a; --button-bgc: #225aea; --calendar-text-color: #151e3a; --week-text-color: #151e3a; --week-day-color: #707ba0; --week-id-color: #c5cce3; --week-tag-bgc: #ffffff; --timer-divider-bgc: #f2f3f8; --timer-progress-bgc: #f2f3f8; --drop-text-color: #a1aac8; --drop-week-text-color: #151e3a; --drop-summary-text: #151e3a; --drop-shadow: -20px 20px 55px rgba(13, 77, 167, 0.2); --days-countdown: -webkit-linear-gradient(90deg, #ffbf1c, #ffce19); --hours-countdown: -webkit-linear-gradient(90deg, #225aea, #22d3ee); --minutes-countdown: -webkit-linear-gradient(90deg, #225aea, #22d3ee); --seconds-countdown: -webkit-linear-gradient(90deg, #5179e5, #177fff); --skeleton-bg: linear-gradient(90deg, #e2e6f3 20%, #ffffff 37%, #e2e6f3 63%); --skeleton-red: linear-gradient(90deg, #22d3ee 20%, #fff4f4 37%, #22d3ee 63%); --skeleton-blue: linear-gradient(90deg, #225aea 20%, #f2f6ff 37%, #225aea 63%); --scroll-gradient-top: linear-gradient(#ffffff, rgba(255, 255, 255, 0.25)); --scroll-gradient-bottom: linear-gradient(rgba(255, 255, 255, 0.25), #ffffff); --locked-gradient: linear-gradient(360deg, #ffffff 0%, rgba(255, 255, 255, 0) 102.78%); --shopify-gradient: linear-gradient(94.11deg, #95bf47 -62.57%, #ffffff 19.28%); --mobile-navigation-gradient: linear-gradient(180deg, rgba(255, 255, 255, 0), #ffffff); --black-to-white: #000000; --white-to-black: #ffffff; --white-to-neutral-dark-200: #ffffff; --white-to-blue-900: #ffffff; --neutral-100-to-700: #f2f3f8; --neutral-700-to-neutral-dark-500: #2b3450; --neutral-800-to-100: #151e3a; --neutral-700-to-100: #2b3450; --completed-video: rgba(255, 255, 255, 0.55); --modal-bg: 0px 24px 24px -12px rgba(21, 30, 58, 0.04),
0px 12px 12px -6px rgba(21, 30, 58, 0.04),
0px 6px 6px -3px rgba(21, 30, 58, 0.04),
0px 3px 3px -1.5px rgba(21, 30, 58, 0.04),
0px 1px 1px -0.5px rgba(21, 30, 58, 0.04),
0px 0px 0px 1px rgba(34, 90, 234, 0.04); --box-shadow-circle: 0px 24px 24px -12px rgba(34, 90, 234, 0.04),
0px 12px 12px -6px rgba(34, 90, 234, 0.04),
0px 6px 6px -3px rgba(34, 90, 234, 0.04),
0px 3px 3px -1.5px rgba(34, 90, 234, 0.04),
0px 1px 1px -0.5px rgba(34, 90, 234, 0.04),
0px 0px 0px 1px rgba(34, 90, 234, 0.04); --box-shadow-object-large: 0px 0px 24px -12px rgba(21, 30, 58, 0.24),
0px 12px 12px -6px rgba(21, 30, 58, 0.06),
0px 6px 6px -3px rgba(21, 30, 58, 0.04),
0px 3px 3px -1.5px rgba(21, 30, 58, 0.04),
0px 1px 1px -0.5px rgba(21, 30, 58, 0.04); --box-shadow-object-middle: 0px 24px 24px -12px rgba(21, 30, 58, 0.04),
0px 12px 12px -6px rgba(21, 30, 58, 0.04),
0px 6px 6px -3px rgba(21, 30, 58, 0.04),
0px 3px 3px -1.5px rgba(21, 30, 58, 0.04),
0px 1px 1px -0.5px rgba(21, 30, 58, 0.04); --box-shadow-btn-secondary: 0px -1px 2px 0px rgba(242, 243, 248, 0.48) inset, 0px 0px 0px 1px rgba(197, 204, 227, 0.45), 0px 4px 4px 0px rgba(21, 30, 58, 0.04); --box-shadow-btn-secondary-without-border: 0px -1px 2px 0px rgba(242, 243, 248, 0.48) inset, 0px 4px 4px 0px rgba(21, 30, 58, 0.04); --box-shadow-left-line: linear-gradient(90deg, rgba(242, 243, 248, 0) 12.01%, rgba(34, 90, 234, 0.15) 84.59%); --box-shadow-right-line: linear-gradient(90deg, rgba(226, 230, 243, 0.55) 0%, rgba(226, 230, 243, 0) 100%); --box-shadow-btn-primary: 0px -1px 2px 0px rgba(20, 72, 203, 0.48) inset, 0px 0px 0px 1px rgba(34, 90, 234, 0.16), 0px 8px 16px -8px rgba(34, 90, 234, 0.64), 0px 4px 4px 0px rgba(0, 0, 0, 0.06); --dark-dropshadow-neutral: 0px -1px 2px 0px rgba(242, 243, 248, 0.48) inset, 0px 0px 0px 1px rgba(197, 204, 227, 0.45), 0px 4px 4px 0px rgba(21, 30, 58, 0.04); --dropshadow-neutral: 0px 8px 40px 0px rgba(112, 123, 160, 0.1); --box-shadow-active-menu: 0px -1px 2px 0px rgba(242, 243, 248, 0.48) inset, 0px 0px 0px 1px rgba(197, 204, 227, 0.45), 0px 4px 4px 0px rgba(21, 30, 58, 0.04); --box-shadow-negative: 0px -1px 2px 0px rgba(242, 243, 248, 0.48) inset, 0px 0px 0px 1px rgba(34, 211, 238, 0.45), 0px 4px 4px 0px rgba(34, 211, 238, 0.04); --bg-yellow: linear-gradient(180deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0) 100%), #f6b60e; --bg-orange: linear-gradient(180deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0) 100%), #df7009; --bg-red: linear-gradient(180deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0) 100%), #22d3ee; --box-shadow-yellow: 0px 20px 20px -10px rgba(98, 36, 10, 0.04),
0px 10px 10px -5px rgba(98, 36, 10, 0.04),
0px 5px 5px -2.5px rgba(98, 36, 10, 0.04),
0px 2.5px 2.5px -1.25px rgba(98, 36, 10, 0.04),
0px 0.833px 0.833px -0.417px rgba(98, 36, 10, 0.04),
0px 0px 0px 0.833px rgba(98, 36, 10, 0.04); --box-shadow-red: 0px 0px 0px 0.83px rgba(112, 6, 6, 0.04),
0px 0.83px 0.83px -0.42px rgba(112, 6, 6, 0.04),
0px 2.5px 2.5px -1.25px rgba(112, 6, 6, 0.04),
0px 5px 5px -2.5px rgba(112, 6, 6, 0.04),
0px 10px 10px -5px rgba(112, 6, 6, 0.04),
0px 20px 20px -10px rgba(112, 6, 6, 0.04); --border-yellow: rgba(160, 116, 1, 0.5); --border-red: #700606; --border-orange: #df7009; --white-to-neutral-dark-100: #ffffff; --blue-depressed-to-neutral-100: #1448cb; --white-to-neutral-dark: #ffffff; --yellow-to-neutral-dark-100: #fff9e8; --white-to-neutral-dark-310: #ffffff; --blue-primary-to-white: #225aea; --blue-100-to-neutral-dark-100: #f2f6ff; --neutral-600-to-neutral-dark-400: #434c69; --neutral-600-to-neutral-dark-500: #434c69; --blue-400-to-neutral-dark-700: #225aea; --blue-400-to-neutral-dark-400: #225aea; --blue-100-to-neutral-dark-400: #f2f6ff; --neutral-100-to-neutral-dark-100: #f2f3f8; --neutral-100-to-neutral-dark-200: #f2f3f8; --neutral-200-to-neutral-dark-300: #e2e6f3; --neutral-300-to-neutral-dark-300: #c5cce3; --neutral-dark-300-to-neutral-300: rgba(255, 255, 255, 0.18); --neutral-500-to-neutral-dark-500: #707ba0; --neutral-400-to-neutral-dark-500: #a1aac8; --neutral-400-to-neutral-dark-400: #a1aac8; --neutral-200-to-neutral-dark-200: #e2e6f3; --bottom-gradient-bg: linear-gradient(180deg, rgba(255, 255, 255, 0) 50%, #fff 100%); --right-gradient-bg: linear-gradient(90deg, rgba(255, 255, 255, 0) 10%, #fff 90%); --blue-100-to-neutral-dark-200: #f2f6ff; --blue-600-to-neutral-dark-500: #1448cb; --neutral-50-to-neutral-dark-50: #f9f9fc; --neutral-50-to-neutral-dark-100: #f9f9fc; --neutral-50-to-neutral-dark-200: #f9f9fc; --neutral-100-to-800: #f2f3f8; --blue-xlight-to-neutral-dark: #f9fbff; --blue-depressed-to-white: #1448cb; --blue-xlight-to-neutral-dark-50: #f9fbff; --blue-xlight-to-neutral-dark-100: #f9fbff; --blue-xlight-to-neutral-dark-500: #f9fbff; --blue-light-to-blue-dark: #f2f6ff; --blue-light-to-neutral-dark-100: #f2f6ff; --yellow-xlight-to-neutral-dark-200: #fffcf4; --yellow-xlight-to-yellow-dark: #fffcf4; --orange-primary-to-orange-xlight: #df7009; --white-to-orange-primary: #ffffff; --neutral-140-to-840: #fafafc; --neutral-100-to-900: #f2f3f8; --neutral-200-to-400: #e2e6f3; --neutral-200-to-500: #e2e6f3; --neutral-200-to-700: #e2e6f3; --neutral-200-to-800: #e2e6f3; --neutral-200-to-900: #e2e6f3; --neutral-300-to-500: #c5cce3; --neutral-300-to-600: #c5cce3; --neutral-300-to-700: #c5cce3; --neutral-300-to-800: #c5cce3; --neutral-400-to-500: #a1aac8; --neutral-400-to-600: #a1aac8; --neutral-500-to-200: #707ba0; --neutral-500-to-100: #707ba0; --neutral-500-to-400: #707ba0; --neutral-500-to-600: #707ba0; --neutral-500-to-800: #707ba0; --neutral-700-to-200: #2b3450; --neutral-800-to-200: #151e3a; --neutral-800-to-300: #151e3a; --neutral-800-to-500: #151e3a; --neutral-800-to-600: #151e3a; --neutral-800-to-700: #151e3a; --neutral-900-to-200: #030625; --neutral-900-to-neutral-dark-50: #030625; --neutral-200-to-neutral-dark-50: #e2e6f3; --neutral-200-to-neutral-dark: #e2e6f3; --neutral-600-to-100: #434c69; --neutral-800-to-neutral-dark: #151e3a; --neutral-800-to-neutral-100: #151e3a; --neutral-100-to-blue-800: #f2f3f8; --neutral-100-to-blue-700: #f2f3f8; --neutral-100-to-blue-900: #f2f3f8; --neutral-100-to-blue-950: #f2f3f8; --neutral-100-to-blue-500: #f2f3f8; --neutral-200-to-blue-600: #e2e6f3; --neutral-200-to-blue-800: #e2e6f3; --neutral-200-to-blue-900: #e2e6f3; --neutral-200-to-blue-700: #e2e6f3; --neutral-300-to-blue-600: #c5cce3; --neutral-300-to-blue-500: #c5cce3; --neutral-300-to-blue-700: #c5cce3; --neutral-300-to-blue-800: #c5cce3; --neutral-400-to-blue-600: #a1aac8; --neutral-400-to-blue-700: #a1aac8; --neutral-500-to-blue-600: #707ba0; --neutral-500-to-blue-700: #707ba0; --neutral-800-to-blue-500: #151e3a; --neutral-800-to-blue-600: #151e3a; --blue-to-neutral-dark-700: #225aea; --blue-depressed-to-neutral-dark-700: #1448cb; --blue-to-neutral-dark-500: #225aea; --blue-to-neutral-dark-400: #225aea; --blue-to-neutral-dark-300: #225aea; --blue-depressed-to-blue-primary: #1448cb; --blue-depressed-to-neutral-dark-500: #1448cb; --blue-light-to-neutral-dark-200: #f2f6ff; --blue-light-to-blue-primary: #f2f6ff; --blue-depressed-to-blue-dark: #1448cb; --neutral-100-to-red-900: #f2f3f8; --neutral-500-to-red-600: #707ba0; --neutral-100-to-yellow-900: #f2f3f8; --neutral-500-to-yellow-600: #707ba0; --neutral-100-to-pink-900: #f2f3f8; --neutral-500-to-pink-600: #707ba0; --neutral-800-to-white: #151e3a; --blue-500-to-white: #225aea; --blue-100-to-dark: #f2f6ff; --blue-200-to-neutral-800: #f2f6ff; --blue-100-to-900: #f2f6ff; --blue-100-to-neutral-900: #f2f6ff; --blue-100-to-950: #f2f6ff; --red-100-to-900: #fff4f4; --yellow-100-to-900: #fff9e8; --pink-100-to-900: #fff9fc; --green-100-to-900: #e7fff1; --purple-100-to-900: #f6f0ff; --brown-100-to-900: #fff6ee; --orange-100-to-900: #fff5ea; --blue-200-to-600: #f2f6ff; --red-200-to-600: #fff4f4; --yellow-200-to-600: #fff9e8; --pink-200-to-600: #ffdeee; --green-200-to-600: #e7fff1; --purple-200-to-600: #f6f0ff; --brown-200-to-600: #f1d5ba; --blue-200-to-700: #f2f6ff; --blue-200-to-800: #f2f6ff; --blue-500-to-400: #225aea; --red-200-to-700: #fff4f4; --red-200-to-800: #fff4f4; --yellow-200-to-700: #fff9e8; --yellow-200-to-800: #fff9e8; --pink-200-to-700: #ffdeee; --green-200-to-700: #e7fff1; --green-200-to-800: #e7fff1; --purple-200-to-700: #f6f0ff; --purple-200-to-800: #f6f0ff; --brown-200-to-700: #f1d5ba; --bottom-gradient: linear-gradient(360deg, #ffffff 65.22%, rgba(255, 255, 255, 0) 95.94%); --grey-to-neutral-dark-400: #a1aac8; --neutral-800-to-900: #151e3a; --image-gallery-gradient-left: linear-gradient(90deg, #ffffff 0%, rgba(255, 255, 255, 0) 98.44%); --image-gallery-gradient-right: linear-gradient(270deg, #ffffff 0%, rgba(255, 255, 255, 0) 98.44%); --white-to-black-blur-gradient: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, white 75%); --tooltip-border-color: #030625;"><head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>Access Denied | SIXSENSE</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #0a0a0f;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #ffffff;
      overflow: hidden;
      position: relative;
    }
    
    /* Base gradient - RED */
    .base-gradient {
      position: fixed;
      inset: 0;
      background: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(34, 211, 238, 0.08) 0%, transparent 50%),
                  linear-gradient(to bottom, #050508 0%, #0a0a0f 100%);
      z-index: 0;
    }
    
    /* Grid Pattern - RED */
    .grid-bg {
      position: fixed;
      inset: 0;
      background-image: linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
      background-size: 60px 60px;
      z-index: 1;
    }
    
    /* Dot accents - RED */
    .dot-accents {
      position: fixed;
      inset: 0;
      background-image: radial-gradient(rgba(34, 211, 238, 0.15) 1px, transparent 1px);
      background-size: 60px 60px;
      background-position: 30px 30px;
      z-index: 2;
    }
    
    /* Vignette effect */
    .vignette {
      position: fixed;
      inset: 0;
      background: radial-gradient(ellipse at center, transparent 0%, rgba(5, 5, 8, 0.4) 100%);
      z-index: 3;
    }
    
    /* Scanline effect */
    .scanlines {
      position: fixed;
      inset: 0;
      pointer-events: none;
      background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.03) 2px, rgba(0, 0, 0, 0.03) 4px);
      z-index: 4;
    }
    
    /* Particle canvas */
    #particleCanvas {
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      opacity: 0.6;
      z-index: 5;
    }
    
    /* Top highlight glow - RED */
    .top-highlight {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.5), transparent);
      box-shadow: 0 0 20px rgba(34, 211, 238, 0.3);
      pointer-events: none;
      z-index: 6;
    }
    
    /* Container */
    .container {
      position: relative;
      z-index: 10;
      max-width: 48rem;
      margin: 0 auto;
      padding: 0 1.5rem;
      text-align: center;
      opacity: 0;
      transform: translateY(2rem);
      animation: fadeInUp 0.7s ease-out forwards;
    }
    
    @keyframes fadeInUp {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    /* Badge */
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 9999px;
      background: rgba(34, 211, 238, 0.2);
      border: 1px solid rgba(34, 211, 238, 0.3);
      margin-bottom: 1.5rem;
      box-shadow: 0 0 20px rgba(34, 211, 238, 0.15);
    }
    
    .badge span {
      font-size: 0.875rem;
      font-weight: 600;
      letter-spacing: 0.15em;
      color: #22d3ee;
      text-transform: uppercase;
    }
    
    /* Title */
    h1 {
      font-size: clamp(2.25rem, 5vw, 3.75rem);
      margin-bottom: 1.25rem;
      line-height: 1.2;
      letter-spacing: -0.025em;
    }
    
    h1 .light {
      font-weight: 300;
      color: #ffffff;
    }
    
    h1 .bold {
      font-weight: 600;
      color: #ffffff;
    }
    
    /* Description */
    .description {
      font-size: clamp(1rem, 2vw, 1.125rem);
      color: #a1a1aa;
      max-width: 36rem;
      margin: 0 auto 2rem auto;
      font-weight: 300;
      line-height: 1.6;
    }
    
    /* Buttons */
    .button-group {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      align-items: center;
      justify-content: center;
    }
    
    @media (min-width: 640px) {
      .button-group {
        flex-direction: row;
      }
    }
    
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-weight: 500;
      font-size: 0.875rem;
      text-decoration: none;
      transition: all 0.3s ease;
      border: 1px solid;
    }
    
    .btn-primary {
      background: rgba(34, 211, 238, 0.1);
      border-color: rgba(34, 211, 238, 0.3);
      color: #22d3ee;
    }
    
    .btn-primary:hover {
      background: rgba(34, 211, 238, 0.2);
      box-shadow: 0 0 20px rgba(34, 211, 238, 0.2);
    }
    
    .btn-secondary {
      background: rgba(24, 24, 27, 0.4);
      border-color: rgba(34, 211, 238, 0.2);
      color: #ffffff;
    }
    
    .btn-secondary:hover {
      border-color: rgba(34, 211, 238, 0.3);
      background: rgba(24, 24, 27, 0.6);
      box-shadow: 0 0 15px rgba(34, 211, 238, 0.15);
    }
    
    .icon {
      width: 1rem;
      height: 1rem;
    }
  </style>
</head>
<body>
  <!-- Base gradient - RED -->
  <div class="base-gradient"></div>
  
  <!-- Grid Pattern - RED -->
  <div class="grid-bg"></div>
  
  <!-- Dot accents - RED -->
  <div class="dot-accents"></div>
  
  <!-- Particle canvas - RED -->
  <canvas id="particleCanvas" width="1408" height="1264"></canvas>
  
  <!-- Vignette effect -->
  <div class="vignette"></div>
  
  <!-- Scanline effect -->
  <div class="scanlines"></div>
  
  <!-- Top highlight glow - RED -->
  <div class="top-highlight"></div>
  
  <!-- Main Container -->
  <div class="container">
    <!-- Badge -->
    <div class="badge">
      <span>403 Error</span>
    </div>
    
    <!-- Title -->
    <h1>
      <span class="light">Access </span><span class="bold">Denied</span>
    </h1>
    
    <!-- Description -->
    
    
    <!-- Buttons -->
    
    <div class="button-group">
      <a href="https://sixsense.cloud" class="btn btn-primary">
        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
        </svg>
        <span>Return Home</span>
      </a>
    </div>
    
  </div>
  
  <script>
    // Particle animation - RED theme
    (function() {
      const canvas = document.getElementById('particleCanvas');
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      let particles = [];
      
      function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      
      function createParticles() {
        const particleCount = Math.min(50, Math.floor(window.innerWidth / 30));
        particles = [];
        
        for (let i = 0; i < particleCount; i++) {
          particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 0.5,
            speedX: (Math.random() - 0.5) * 0.3,
            speedY: (Math.random() - 0.5) * 0.3,
            opacity: Math.random() * 0.5 + 0.1,
            pulse: Math.random() * Math.PI * 2,
            pulseSpeed: Math.random() * 0.02 + 0.01
          });
        }
      }
      
      function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(function(particle) {
          particle.x += particle.speedX;
          particle.y += particle.speedY;
          particle.pulse += particle.pulseSpeed;
          
          if (particle.x < 0) particle.x = canvas.width;
          if (particle.x > canvas.width) particle.x = 0;
          if (particle.y < 0) particle.y = canvas.height;
          if (particle.y > canvas.height) particle.y = 0;
          
          const pulseOpacity = particle.opacity * (0.5 + 0.5 * Math.sin(particle.pulse));
          
          // Draw particle - RED
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(34, 211, 238, ' + pulseOpacity + ')';
          ctx.fill();
          
          // Glow effect - RED
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(34, 211, 238, ' + (pulseOpacity * 0.1) + ')';
          ctx.fill();
        });
        
        // Connection lines - RED
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const p1 = particles[i];
            const p2 = particles[j];
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 150) {
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = 'rgba(34, 211, 238, ' + (0.03 * (1 - distance / 150)) + ')';
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
        
        requestAnimationFrame(animate);
      }
      
      resize();
      createParticles();
      animate();
      
      window.addEventListener('resize', function() {
        resize();
        createParticles();
      });
    })();
  </script>
<script defer="" src="https://static.cloudflareinsights.com/beacon.min.js/v833ccba57c9e4d2798f2e76cebdd09a11778172276447" integrity="sha512-57MDmcccJXYtNnH+ZiBwzC4jb2rvgVCEokYN+L/nLlmO8rfYT/gIpW2A569iJ/3b+0UEasghjuZH/ma3wIs/EQ==" data-cf-beacon="{&quot;version&quot;:&quot;2024.11.0&quot;,&quot;token&quot;:&quot;4f68841b060f430d86695c474cd68d7c&quot;,&quot;r&quot;:1,&quot;server_timing&quot;:{&quot;name&quot;:{&quot;cfCacheStatus&quot;:true,&quot;cfEdge&quot;:true,&quot;cfExtPri&quot;:true,&quot;cfL4&quot;:true,&quot;cfOrigin&quot;:true,&quot;cfSpeedBrain&quot;:true},&quot;location_startswith&quot;:null}}" crossorigin="anonymous"></script>

<div id="my-extension-root" class="my-extension-root" style="width: 100vw; height: 1px; position: fixed; top: 0px; left: 0px; z-index: 2147483641; display: none;"></div></body></html>`;

export default async function handler(req, res) {
    const ip = req.headers["cf-connecting-ip"] || req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || req.socket.remoteAddress;
    const detectedIp = ip ? ip.split(",")[0].trim() : "Inconnue";

    if (!ALLOWED_IPS.includes(detectedIp)) {
        res.setHeader("Content-Type", "text/html");
        return res.status(403).send(ACCESS_DENIED_HTML(detectedIp));
    }

    const LUA_SCRIPT_CONTENT = Buffer.from(LUA_SCRIPT_BASE64, "base64").toString("utf8");

    if (req.method === "POST") {
        let body = "";
        await new Promise((resolve) => {
            req.on("data", (chunk) => { body += chunk; });
            req.on("end", resolve);
        });
        
        const params = new URLSearchParams(body);
        const password = params.get("password");

        if (password === PASSWORD) {
            res.setHeader("Set-Cookie", `auth=${Buffer.from(PASSWORD).toString("base64")}; Path=/; HttpOnly; Max-Age=3600`);
            res.setHeader("Content-Type", "text/plain; charset=utf-8");
            return res.status(200).send(LUA_SCRIPT_CONTENT);
        } else {
            res.setHeader("Content-Type", "text/html");
            return res.status(401).send(LOGIN_HTML(detectedIp, "Mot de passe incorrect."));
        }
    }

    const cookies = req.headers.cookie || "";
    if (cookies.includes(`auth=${Buffer.from(PASSWORD).toString("base64")}`)) {
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        return res.status(200).send(LUA_SCRIPT_CONTENT);
    }

    res.setHeader("Content-Type", "text/html");
    return res.status(200).send(LOGIN_HTML(detectedIp));
}
