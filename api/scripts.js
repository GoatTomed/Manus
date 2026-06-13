const ALLOWED_IPS = ["24.49.252.230"];
const PASSWORD = "Tocson123";

const LUA_SCRIPT_BASE64 = "LS1bWyBZb3VTdWNrIOKAlCBLZXkgU3lzdGVtIF1dDQpsb2NhbCBQbGF5ZXJzID0gZ2FtZTpHZXRTZXJ2aWNlKCJQbGF5ZXJzIikNCmxvY2FsIFR3ZWVuU2VydmljZSA9IGdhbWU6R2V0U2VydmljZSgiVHdlZW5TZXJ2aWNlIikNCmxvY2FsIFJ1blNlcnZpY2UgPSBnYW1lOkdldFNlcnZpY2UoIlJ1blNlcnZpY2UiKQ0KbG9jYWwgSHR0cFNlcnZpY2UgPSBnYW1lOkdldFNlcnZpY2UoIkh0dHBTZXJ2aWNlIikNCmxvY2FsIFN0YXJ0ZXJHdWkgPSBnYW1lOkdldFNlcnZpY2UoIlN0YXJ0ZXJHdWkiKQ0KbG9jYWwgUGxheWVyID0gUGxheWVycy5Mb2NhbFBsYXllcg0KbG9jYWwgcmVxdWVzdCA9IChzeW4gYW5kIHN5bi5yZXF1ZXN0KSBvciAoaHR0cCBhbmQgaHR0cC5yZXF1ZXN0KSBvciBodHRwX3JlcXVlc3Qgb3IgKGZsdXh1cyBhbmQgZmx1eHVzLnJlcXVlc3QpIG9yIHJlcXVlc3QNCmlmIG5vdCByZXF1ZXN0IHRoZW4gcmVxdWVzdCA9IGZ1bmN0aW9uKG8pIHJldHVybiBIdHRwU2VydmljZTpSZXF1ZXN0QXN5bmMobykgZW5kIGVuZA0KDQpsb2NhbCBBUElfVVJMID0gImh0dHBzOi8veW91cnN1Y2sudmVyY2VsLmFwcC9hcGkvdmVyaWZ5LWtleSINCg0KLS0gUEFMRVRURQ0KbG9jYWwgQyA9IHsNCglCRyA9IENvbG9yMy5mcm9tUkdCKDEwLCAxMCwgMTApLA0KCVN1cmZhY2UgPSBDb2xvcjMuZnJvbVJHQigxNSwgMTUsIDE1KSwNCglSYWlzZWQgPSBDb2xvcjMuZnJvbVJHQigyMiwgMjIsIDIyKSwNCglCb3JkZXIgPSBDb2xvcjMuZnJvbVJHQigzOCwgMzgsIDM4KSwNCglQcmltYXJ5ID0gQ29sb3IzLmZyb21SR0IoMSwgMTY4LCAyMjUpLA0KCVByaW1hcnlMbz0gQ29sb3IzLmZyb21SR0IoMSwgMTM0LCAxODEpLA0KCVRleHQgPSBDb2xvcjMuZnJvbVJHQigyNDAsIDI0MCwgMjQwKSwNCglUZXh0TWlkID0gQ29sb3IzLmZyb21SR0IoMTUwLCAxNTAsIDE1MCksDQoJVGV4dExvdyA9IENvbG9yMy5mcm9tUkdCKDc1LCA3NSwgNzUpLA0KCVN1Y2Nlc3MgPSBDb2xvcjMuZnJvbVJHQigzNCwgMTk3LCA5NCksDQoJRXJyb3IgPSBDb2xvcjMuZnJvbVJHQigyMzksIDY4LCA2OCksDQoJV2hpdGUgPSBDb2xvcjMubmV3KDEsIDEsIDEpLA0KfQ0KDQotLSBIRUxQRVJTDQpsb2NhbCBmdW5jdGlvbiB0dyhvYmosIGdvYWwsIHQsIHN0eWxlLCBkaXIpDQoJVHdlZW5TZXJ2aWNlOkNyZWF0ZShvYmosIFR3ZWVuSW5mby5uZXcodCBvciAwLjE4LCBzdHlsZSBvciBFbnVtLkVhc2luZ1N0eWxlLlF1YXJ0LCBkaXIgb3IgRW51bS5FYXNpbmdEaXJlY3Rpb24uT3V0KSwgZ29hbCk6UGxheSgpDQplbmQNCmxvY2FsIGZ1bmN0aW9uIGNvcm5lcihwLCByKSBsb2NhbCBjID0gSW5zdGFuY2UubmV3KCJVSUNvcm5lciIsIHApIGMuQ29ybmVyUmFkaXVzID0gVURpbS5uZXcoMCwgciBvciA2KSByZXR1cm4gYyBlbmQNCmxvY2FsIGZ1bmN0aW9uIHN0cm9rZShwLCBjb2wsIHRoaWNrKSBsb2NhbCBzID0gSW5zdGFuY2UubmV3KCJVSVN0cm9rZSIsIHApIHMuQ29sb3IgPSBjb2wgb3IgQy5Cb3JkZXIgcy5UaGlja25lc3MgPSB0aGljayBvciAxIHJldHVybiBzIGVuZA0KbG9jYWwgZnVuY3Rpb24gcGFkKHAsIGwsIHIsIHQsIGIpDQoJbG9jYWwgdSA9IEluc3RhbmNlLm5ldygiVUlQYWRkaW5nIiwgcCkNCgl1LlBhZGRpbmdMZWZ0ID0gVURpbS5uZXcoMCwgbCBvciAwKQ0KCXUuUGFkZGluZ1JpZ2h0ID0gVURpbS5uZXcoMCwgciBvciAwKQ0KCXUuUGFkZGluZ1RvcCA9IFVEaW0ubmV3KDAsIHQgb3IgMCkNCgl1LlBhZGRpbmdCb3R0b20gPSBVRGltLm5ldygwLCBiIG9yIDApDQplbmQNCmxvY2FsIGZ1bmN0aW9uIGxibChwYXJlbnQsIHByb3BzKQ0KCWxvY2FsIGwgPSBJbnN0YW5jZS5uZXcoIlRleHRMYWJlbCIsIHBhcmVudCkNCglsLkJhY2tncm91bmRUcmFuc3BhcmVuY3kgPSAxDQoJbC5Cb3JkZXJTaXplUGl4ZWwgPSAwDQoJbC5SaWNoVGV4dCA9IHRydWUNCglmb3IgaywgdiBpbiBwYWlycyhwcm9wcykgZG8gbFtrXSA9IHYgZW5kDQoJcmV0dXJuIGwNCmVuZA0KbG9jYWwgZnVuY3Rpb24gZnJtKHBhcmVudCwgcHJvcHMpDQoJbG9jYWwgZiA9IEluc3RhbmNlLm5ldygiRnJhbWUiLCBwYXJlbnQpDQoJZi5Cb3JkZXJTaXplUGl4ZWwgPSAwDQoJZm9yIGssIHYgaW4gcGFpcnMocHJvcHMpIGRvIGZba10gPSB2IGVuZA0KCXJldHVybiBmDQplbmQNCmxvY2FsIGZ1bmN0aW9uIG1ha2VEcmFnZ2FibGUocm9vdCwgaGFuZGxlKQ0KCWhhbmRsZSA9IGhhbmRsZSBvciByb290DQoJbG9jYWwgZHJhZywgZHN0YXJ0LCBvcG9zDQoJaGFuZGxlLklucHV0QmVnYW46Q29ubmVjdChmdW5jdGlvbihpKQ0KCQlpZiBpLlVzZXJJbnB1dFR5cGUgPT0gRW51bS5Vc2VySW5wdXRUeXBlLk1vdXNlQnV0dG9uMSBvciBpLlVzZXJJbnB1dFR5cGUgPT0gRW51bS5Vc2VySW5wdXRUeXBlLlRvdWNoIHRoZW4NCgkJCWRyYWcgPSB0cnVlOyBkc3RhcnQgPSBpLlBvc2l0aW9uOyBvcG9zID0gcm9vdC5Qb3NpdGlvbg0KCQkJaS5DaGFuZ2VkOkNvbm5lY3QoZnVuY3Rpb24oKSBpZiBpLlVzZXJJbnB1dFN0YXRlID09IEVudW0uVXNlcklucHV0U3RhdGUuRW5kIHRoZW4gZHJhZyA9IGZhbHNlIGVuZCBlbmQpDQoJCWVuZA0KCWVuZCkNCgloYW5kbGUuSW5wdXRDaGFuZ2VkOkNvbm5lY3QoZnVuY3Rpb24oaSkNCgkJaWYgZHJhZyBhbmQgKGkuVXNlcklucHV0VHlwZSA9PSBFbnVtLlVzZXJJbnB1dFR5cGUuTW91c2VNb3ZlbWVudCBvciBpLlVzZXJJbnB1dFR5cGUgPT0gRW51bS5Vc2VySW5wdXRUeXBlLlRvdWNoKSB0aGVuDQoJCQlsb2NhbCBkID0gaS5Qb3NpdGlvbiAtIGRzdGFydA0KCQkJcm9vdC5Qb3NpdGlvbiA9IFVEaW0yLm5ldyhvcG9zLlguU2NhbGUsIG9wb3MuWC5PZmZzZXQgKyBkLlgsIG9wb3MuWS5TY2FsZSwgb3Bvcy5ZLk9mZnNldCArIGQuWSkNCgkJZW5kDQoJZW5kKQ0KZW5kDQoNCi0tIEdVSQ0KbG9jYWwgR3VpID0gSW5zdGFuY2UubmV3KCJTY3JlZW5HdWkiKQ0KR3VpLk5hbWUgPSAiS2V5U3lzdGVtIg0KR3VpLlJlc2V0T25TcGF3biA9IGZhbHNlDQpHdWkuSWdub3JlR3VpSW5zZXQgPSB0cnVlDQpHdWkuRGlzcGxheU9yZGVyID0gOTk5DQpHdWkuUGFyZW50ID0gUGxheWVyOldhaXRGb3JDaGlsZCgiUGxheWVyR3VpIikNCg0KbG9jYWwgU2NyaW0gPSBmcm0oR3VpLCB7DQoJU2l6ZSA9IFVEaW0yLm5ldygxLDAsMSwwKSwNCglCYWNrZ3JvdW5kQ29sb3IzID0gQ29sb3IzLm5ldygwLDAsMCksDQoJQmFja2dyb3VuZFRyYW5zcGFyZW5jeSA9IDEsDQoJWkluZGV4ID0gMSwNCn0pDQp0dyhTY3JpbSwge0JhY2tncm91bmRUcmFuc3BhcmVuY3kgPSAwLjZ9LCAwLjQpDQoNCi0tIENBUkQNCmxvY2FsIFcsIEggPSA0MDAsIDI5MA0KbG9jYWwgQ2FyZCA9IGZybShHdWksIHsNCglTaXplID0gVURpbTIubmV3KDAsIFcsIDAsIEgpLA0KCVBvc2l0aW9uID0gVURpbTIubmV3KDAuNSwgLVcvMiwgMC41LCAtSC8yICsgMjQpLA0KCUJhY2tncm91bmRDb2xvcjMgPSBDLlN1cmZhY2UsDQoJQmFja2dyb3VuZFRyYW5zcGFyZW5jeSA9IDEsDQoJWkluZGV4ID0gMiwNCn0pDQpjb3JuZXIoQ2FyZCwgMTApDQpzdHJva2UoQ2FyZCwgQy5Cb3JkZXIsIDEpDQp0dyhDYXJkLCB7QmFja2dyb3VuZFRyYW5zcGFyZW5jeSA9IDAsIFBvc2l0aW9uID0gVURpbTIubmV3KDAuNSwtVy8yLDAuNSwtSC8yKX0sIDAuNCwgRW51bS5FYXNpbmdTdHlsZS5RdWFydCkNCg0KLS0gVElUTEVCQVINCmxvY2FsIFRCYXIgPSBmcm0oQ2FyZCwgew0KCVNpemUgPSBVRGltMi5uZXcoMSwgMCwgMCwgNDApLA0KCUJhY2tncm91bmRDb2xvcjMgPSBDb2xvcjMuZnJvbVJHQigxNCwgMTQsIDE0KSwNCglaSW5kZXggPSAzLA0KfSkNCmNvcm5lcihUQmFyLCAxMCkNCmZybShUQmFyLCB7DQoJU2l6ZSA9IFVEaW0yLm5ldygxLCAwLCAwLCAxMCksDQoJUG9zaXRpb24gPSBVRGltMi5uZXcoMCwgMCwgMSwgLTEwKSwNCglCYWNrZ3JvdW5kQ29sb3IzID0gQ29sb3IzLmZyb21SR0IoMTQsIDE0LCAxNCksDQp9KQ0KZnJtKENhcmQsIHsNCglTaXplID0gVURpbTIubmV3KDEsIDAsIDAsIDEpLA0KCVBvc2l0aW9uID0gVURpbTIubmV3KDAsIDAsIDAsIDQwKSwNCglCYWNrZ3JvdW5kQ29sb3IzID0gQy5Cb3JkZXIsDQoJWkluZGV4ID0gMywNCn0pDQptYWtlRHJhZ2dhYmxlKENhcmQsIFRCYXIpDQpsYmwoVEJhciwgew0KCVNpemUgPSBVRGltMi5uZXcoMCwgMTIwLCAxLCAwKSwNCglQb3NpdGlvbiA9IFVEaW0yLm5ldygwLCAxMiwgMCwgMCksDQoJVGV4dCA9ICIgIiwNCglUZXh0Q29sb3IzID0gQy5UZXh0LA0KCVRleHRTaXplID0gMjAsDQoJRm9udCA9IEVudW0uRm9udC5Hb3RoYW0sDQoJVGV4dFhBbGlnbm1lbnQgPSBFbnVtLlRleHRYQWxpZ25tZW50LkxlZnQsDQoJWkluZGV4ID0gNCwNCn0pDQpsb2NhbCBDbG9zZUJ0biA9IEluc3RhbmNlLm5ldygiVGV4dEJ1dHRvbiIsIFRCYXIpDQpDbG9zZUJ0bi5TaXplID0gVURpbTIubmV3KDAsIDI4LCAxLCAwKQ0KQ2xvc2VCdG4uUG9zaXRpb24gPSBVRGltMi5uZXcoMSwgLTMwLCAwLCAwKQ0KQ2xvc2VCdG4uQmFja2dyb3VuZFRyYW5zcGFyZW5jeSA9IDENCkNsb3NlQnRuLlRleHQgPSAiWCINCkNsb3NlQnRuLlRleHRDb2xvcjMgPSBDb2xvcjMuZnJvbVJHQigxODAsIDE4MCwgMTgwKQ0KQ2xvc2VCdG4uRm9udCA9IEVudW0uRm9udC5Hb3RoYW0NCkNsb3NlQnRuLlRleHRTaXplID0gMTMNCkNsb3NlQnRuLlpJbmRleCA9IDUNCkNsb3NlQnRuLk1vdXNlRW50ZXI6Q29ubmVjdChmdW5jdGlvbigpIHR3KENsb3NlQnRuLHtUZXh0Q29sb3IzPUMuV2hpdGV9LDAuMSkgZW5kKQ0KQ2xvc2VCdG4uTW91c2VMZWF2ZTpDb25uZWN0KGZ1bmN0aW9uKCkgdHcoQ2xvc2VCdG4se1RleHRDb2xvcjM9Q29sb3IzLmZyb21SR0IoMTgwLDE4MCwxODApfSwwLjEpIGVuZCkNCkNsb3NlQnRuLk1vdXNlQnV0dG9uMUNsaWNrOkNvbm5lY3QoZnVuY3Rpb24oKQ0KCXR3KENhcmQsIHtCYWNrZ3JvdW5kVHJhbnNwYXJlbmN5PTEsIFBvc2l0aW9uPVVEaW0yLm5ldygwLjUsLVcvMiwwLjUsLUgvMisxOCl9LCAwLjI1KQ0KCXR3KFNjcmltLCB7QmFja2dyb3VuZFRyYW5zcGFyZW5jeT0xfSwgMC4yNSkNCgl0YXNrLmRlbGF5KDAuMywgZnVuY3Rpb24oKSBHdWk6RGVzdHJveSgpIGVuZCkNCmVuZCkNCg0KLS0gQk9EWQ0KbG9jYWwgQm9keSA9IGZybShDYXJkLCB7DQoJU2l6ZSA9IFVEaW0yLm5ldygxLCAwLCAxLCAtNDEpLA0KCVBvc2l0aW9uID0gVURpbTIubmV3KDAsIDAsIDAsIDQxKSwNCglCYWNrZ3JvdW5kVHJhbnNwYXJlbmN5ID0gMSwNCglaSW5kZXggPSAzLA0KfSkNCnBhZChCb2R5LCAyMiwgMjIsIDAsIDApDQoNCmxvY2FsIFRpdGxlID0gbGJsKEJvZHksIHsNCglTaXplID0gVURpbTIubmV3KDEsIDAsIDAsIDI2KSwNCglQb3NpdGlvbiA9IFVEaW0yLm5ldygwLCAwLCAwLCAxNiksDQoJVGV4dENvbG9yMyA9IEMuVGV4dCwNCglUZXh0U2l6ZSA9IDI4LA0KCUZvbnQgPSBFbnVtLkZvbnQuR290aGFtQm9sZCwNCglUZXh0WEFsaWdubWVudCA9IEVudW0uVGV4dFhBbGlnbm1lbnQuTGVmdCwNCglaSW5kZXggPSA0LA0KfSkNClRpdGxlLlJpY2hUZXh0ID0gdHJ1ZQ0KVGl0bGUuVGV4dCA9ICcgICAgICAgICAgICAgICAgICA8Zm9udCBjb2xvcj0iI0ZGRkZGRiI+WW91PC9mb250Pjxmb250IGNvbG9yPSIjMDBBQkZGIj5TdWNrPC9mb250PicNCg0KbGJsKEJvZHksIHsNCglTaXplID0gVURpbTIubmV3KDEsIDAsIDAsIDE0KSwNCglQb3NpdGlvbiA9IFVEaW0yLm5ldygwLCAwLCAwLCA0NCksDQoJVGV4dCA9ICIgIiwNCglUZXh0Q29sb3IzID0gQy5UZXh0TWlkLA0KCVRleHRTaXplID0gMTEsDQoJRm9udCA9IEVudW0uRm9udC5Hb3RoYW0sDQoJVGV4dFhBbGlnbm1lbnQgPSBFbnVtLlRleHRYQWxpZ25tZW50LkxlZnQsDQoJWkluZGV4ID0gNCwNCn0pDQoNCi0tIElOUFVUDQpsb2NhbCBJbnB1dFdyYXAgPSBmcm0oQm9keSwgew0KCVNpemUgPSBVRGltMi5uZXcoMSwgMCwgMCwgNDIpLA0KCVBvc2l0aW9uID0gVURpbTIubmV3KDAsIDAsIDAsIDcwKSwNCglCYWNrZ3JvdW5kQ29sb3IzID0gQy5SYWlzZWQsDQoJWkluZGV4ID0gNCwNCn0pDQpjb3JuZXIoSW5wdXRXcmFwLCA3KQ0KbG9jYWwgSW5wdXRTdHJva2UgPSBzdHJva2UoSW5wdXRXcmFwLCBDLkJvcmRlciwgMSkNCmxvY2FsIElucHV0ID0gSW5zdGFuY2UubmV3KCJUZXh0Qm94IiwgSW5wdXRXcmFwKQ0KSW5wdXQuU2l6ZSA9IFVEaW0yLm5ldygxLCAwLCAxLCAwKQ0KSW5wdXQuQmFja2dyb3VuZFRyYW5zcGFyZW5jeSA9IDENCklucHV0LlRleHQgPSAiIg0KSW5wdXQuUGxhY2Vob2xkZXJUZXh0ID0gIlBhc3RlIEtleSBIZXJlIg0KSW5wdXQuVGV4dENvbG9yMyA9IEMuVGV4dA0KSW5wdXQuUGxhY2Vob2xkZXJDb2xvcjMgPSBDLlRleHRMb3cNCklucHV0LkZvbnQgPSBFbnVtLkZvbnQuR290aGFtDQpJbnB1dC5UZXh0U2l6ZSA9IDEyDQpJbnB1dC5DbGVhclRleHRPbkZvY3VzID0gZmFsc2UNCklucHV0LlpJbmRleCA9IDUNCnBhZChJbnB1dCwgMTQsIDE0LCAwLCAwKQ0KSW5wdXQuRm9jdXNlZDpDb25uZWN0KGZ1bmN0aW9uKCkNCgl0dyhJbnB1dFN0cm9rZSwge0NvbG9yID0gQy5QcmltYXJ5LCBUcmFuc3BhcmVuY3kgPSAwLjM1fSkNCgl0dyhJbnB1dFdyYXAsIHtCYWNrZ3JvdW5kQ29sb3IzID0gQ29sb3IzLmZyb21SR0IoMTIsMjQsMzIpfSkNCmVuZCkNCklucHV0LkZvY3VzTG9zdDpDb25uZWN0KGZ1bmN0aW9uKCkNCgl0dyhJbnB1dFN0cm9rZSwge0NvbG9yID0gQy5Cb3JkZXIsIFRyYW5zcGFyZW5jeSA9IDB9KQ0KCXR3KElucHV0V3JhcCwge0JhY2tncm91bmRDb2xvcjMgPSBDLlJhaXNlZH0pDQplbmQpDQoNCi0tIFNUQVRVUw0KbG9jYWwgU3RhdHVzUm93ID0gZnJtKEJvZHksIHsNCglTaXplID0gVURpbTIubmV3KDEsIDAsIDAsIDE4KSwNCglQb3NpdGlvbiA9IFVEaW0yLm5ldygwLCAwLCAwLCAxNzgpLA0KCUJhY2tncm91bmRUcmFuc3BhcmVuY3kgPSAxLA0KCVpJbmRleCA9IDQsDQp9KQ0KbG9jYWwgU0RvdCA9IGZybShTdGF0dXNSb3csIHsNCglTaXplID0gVURpbTIubmV3KDAsIDYsIDAsIDYpLA0KCVBvc2l0aW9uID0gVURpbTIubmV3KDAsIDAsIDAuNSwgLTMpLA0KCUJhY2tncm91bmRDb2xvcjMgPSBDLlRleHRMb3csDQoJWkluZGV4ID0gNSwNCn0pDQpjb3JuZXIoU0RvdCwgMykNCmxvY2FsIFNMYmwgPSBsYmwoU3RhdHVzUm93LCB7DQoJU2l6ZSA9IFVEaW0yLm5ldygxLCAtMTIsIDEsIDApLA0KCVBvc2l0aW9uID0gVURpbTIubmV3KDAsIDEyLCAwLCAwKSwNCglUZXh0ID0gIkF3YWl0aW5nIGlucHV0IiwNCglUZXh0Q29sb3IzID0gQy5UZXh0TG93LA0KCVRleHRTaXplID0gMTEsDQoJRm9udCA9IEVudW0uRm9udC5Hb3RoYW0sDQoJVGV4dFhBbGlnbm1lbnQgPSBFbnVtLlRleHRYQWxpZ25tZW50LkxlZnQsDQoJWkluZGV4ID0gNSwNCn0pDQoNCmxvY2FsIGZ1bmN0aW9uIHNldFN0YXR1cyhtc2csIGNvbCwgZG90Q29sKQ0KCVNMYmwuVGV4dCA9IG1zZw0KCVNMYmwuVGV4dENvbG9yMyA9IGNvbCBvciBDLlRleHRMb3cNCgl0dyhTRG90LCB7QmFja2dyb3VuZENvbG9yMyA9IGRvdENvbCBvciBDLlRleHRMb3d9LCAwLjE1KQ0KZW5kDQoNCi0tIEZPT1RFUg0KbG9jYWwgRm9vdGVyID0gZnJtKEJvZHksIHsNCglTaXplID0gVURpbTIubmV3KDEsIDAsIDAsIDM0KSwNCglQb3NpdGlvbiA9IFVEaW0yLm5ldygwLCAwLCAxLCAtMzQpLA0KCUJhY2tncm91bmRUcmFuc3BhcmVuY3kgPSAxLA0KCVpJbmRleCA9IDQsDQp9KQ0KZnJtKEZvb3Rlciwge1NpemU9VURpbTIubmV3KDEsMCwwLDEpLCBCYWNrZ3JvdW5kQ29sb3IzPUMuQm9yZGVyfSkNCmxibChGb290ZXIsIHsNCglTaXplPVVEaW0yLm5ldygwLjUsMCwxLDApLA0KCVBvc2l0aW9uPVVEaW0yLm5ldygwLDAsMCwwKSwNCglUZXh0PSIiLA0KCVRleHRDb2xvcjM9Qy5UZXh0TG93LA0KCVRleHRTaXplPTEwLA0KCUZvbnQ9RW51bS5Gb250LkdvdGhhbSwNCglUZXh0WEFsaWdubWVudD1FbnVtLlRleHRYQWxpZ25tZW50LkxlZnQsDQoJWkluZGV4PTUsDQp9KQ0KDQotLSBUT0FTVCAobW92ZWQgdXAgc28gYnV0dG9ucyBjYW4gdXNlIGl0KQ0KbG9jYWwgZnVuY3Rpb24gdG9hc3QobXNnLCBjb2wsIGR1cmF0aW9uKQ0KCWNvbCA9IGNvbCBvciBDLlByaW1hcnk7IGR1cmF0aW9uID0gZHVyYXRpb24gb3IgMw0KCWxvY2FsIFQgPSBmcm0oR3VpLCB7DQoJCVNpemU9VURpbTIubmV3KDAsMjYwLDAsNDQpLA0KCQlQb3NpdGlvbj1VRGltMi5uZXcoMC41LC0xMzAsMSwxMCksDQoJCUJhY2tncm91bmRDb2xvcjM9Qy5TdXJmYWNlLA0KCQlaSW5kZXg9MjAsDQoJfSkNCgljb3JuZXIoVCwgOCk7IHN0cm9rZShULCBjb2wsIDEpDQoJbG9jYWwgQWNjID0gZnJtKFQsIHtTaXplPVVEaW0yLm5ldygwLDMsMSwtMTYpLCBQb3NpdGlvbj1VRGltMi5uZXcoMCw3LDAsOCksIEJhY2tncm91bmRDb2xvcjM9Y29sLCBaSW5kZXg9MjF9KQ0KCWNvcm5lcihBY2MsIDIpDQoJbGJsKFQsIHtTaXplPVVEaW0yLm5ldygxLC0yMiwxLDApLCBQb3NpdGlvbj1VRGltMi5uZXcoMCwxOCwwLDApLCBUZXh0PW1zZywgVGV4dENvbG9yMz1DLlRleHQsIFRleHRTaXplPTEyLCBGb250PUVudW0uRm9udC5Hb3RoYW1Cb2xkLCBUZXh0WEFsaWdubWVudD1FbnVtLlRleHRYQWxpZ25tZW50LkxlZnQsIFpJbmRleD0yMn0pDQoJdHcoVCwge1Bvc2l0aW9uPVVEaW0yLm5ldygwLjUsLTEzMCwxLC01NCl9LCAwLjM1LCBFbnVtLkVhc2luZ1N0eWxlLkJhY2spDQoJdGFzay5kZWxheShkdXJhdGlvbiwgZnVuY3Rpb24oKQ0KCQl0dyhULCB7UG9zaXRpb249VURpbTIubmV3KDAuNSwtMTMwLDEsMTApLCBCYWNrZ3JvdW5kVHJhbnNwYXJlbmN5PTF9LCAwLjMpDQoJCXRhc2suZGVsYXkoMC4zNSwgZnVuY3Rpb24oKSBUOkRlc3Ryb3koKSBlbmQpDQoJZW5kKQ0KZW5kDQoNCi0tIEJVVFRPTlMgUk9XDQpsb2NhbCBCdG5Sb3cgPSBmcm0oQm9keSwgew0KCVNpemUgPSBVRGltMi5uZXcoMSwgMCwgMCwgNDIpLA0KCVBvc2l0aW9uID0gVURpbTIubmV3KDAsIDAsIDAsIDEyNCksDQoJQmFja2dyb3VuZFRyYW5zcGFyZW5jeSA9IDEsDQoJWkluZGV4ID0gNCwNCn0pDQoNCi0tIEdFVCBLRVkgYnV0dG9uIChsZWZ0IGhhbGYpDQpsb2NhbCBHZXRLZXlXcmFwID0gZnJtKEJ0blJvdywgew0KCVNpemUgPSBVRGltMi5uZXcoMC40OCwgMCwgMSwgMCksDQoJUG9zaXRpb24gPSBVRGltMi5uZXcoMCwgMCwgMCwgMCksDQoJQmFja2dyb3VuZENvbG9yMyA9IEMuUHJpbWFyeSwNCglaSW5kZXggPSA0LA0KfSkNCmNvcm5lcihHZXRLZXlXcmFwLCA3KQ0KbG9jYWwgR2V0S2V5QnRuID0gSW5zdGFuY2UubmV3KCJUZXh0QnV0dG9uIiwgR2V0S2V5V3JhcCkNCkdldEtleUJ0bi5TaXplID0gVURpbTIubmV3KDEsIDAsIDEsIDApDQpHZXRLZXlCdG4uQmFja2dyb3VuZFRyYW5zcGFyZW5jeSA9IDENCkdldEtleUJ0bi5UZXh0ID0gIkdldCBLZXkiDQpHZXRLZXlCdG4uVGV4dENvbG9yMyA9IEMuV2hpdGUNCkdldEtleUJ0bi5Gb250ID0gRW51bS5Gb250LkdvdGhhbUJvbGQNCkdldEtleUJ0bi5UZXh0U2l6ZSA9IDEzDQpHZXRLZXlCdG4uWkluZGV4ID0gNQ0KR2V0S2V5QnRuLk1vdXNlRW50ZXI6Q29ubmVjdChmdW5jdGlvbigpIHR3KEdldEtleVdyYXAsIHtCYWNrZ3JvdW5kQ29sb3IzID0gQ29sb3IzLmZyb21SR0IoMywxOTAsMjU1KX0pIGVuZCkNCkdldEtleUJ0bi5Nb3VzZUxlYXZlOkNvbm5lY3QoZnVuY3Rpb24oKSB0dyhHZXRLZXlXcmFwLCB7QmFja2dyb3VuZENvbG9yMyA9IEMuUHJpbWFyeX0pIGVuZCkNCkdldEtleUJ0bi5Nb3VzZUJ1dHRvbjFEb3duOkNvbm5lY3QoZnVuY3Rpb24oKSB0dyhHZXRLZXlXcmFwLCB7QmFja2dyb3VuZENvbG9yMyA9IEMuUHJpbWFyeUxvfSwgMC4wOCkgZW5kKQ0KR2V0S2V5QnRuLk1vdXNlQnV0dG9uMVVwOkNvbm5lY3QoZnVuY3Rpb24oKQ0KCXR3KEdldEtleVdyYXAsIHtCYWNrZ3JvdW5kQ29sb3IzID0gQy5QcmltYXJ5fSwgMC4xKQ0KCXNldGNsaXBib2FyZCgiaHR0cHM6Ly95b3Vyc3Vjay52ZXJjZWwuYXBwLyIpDQoJcGNhbGwoZnVuY3Rpb24oKQ0KCQlTdGFydGVyR3VpOlNldENvcmUoIlNlbmROb3RpZmljYXRpb24iLCB7DQoJCQlUaXRsZSA9ICJZb3VTdWNrIiwNCgkJCVRleHQgPSAiTGluayBjb3BpZWQgdG8gY2xpcGJvYXJkISIsDQoJCQlEdXJhdGlvbiA9IDMsDQoJCX0pDQoJZW5kKQ0KCXRvYXN0KCJMaW5rIGNvcGllZCB0byBjbGlwYm9hcmQhIiwgQy5QcmltYXJ5LCAyLjUpDQplbmQpDQoNCi0tIFZFUklGWSBLRVkgYnV0dG9uIChyaWdodCBoYWxmKQ0KbG9jYWwgQnRuV3JhcCA9IGZybShCdG5Sb3csIHsNCglTaXplID0gVURpbTIubmV3KDAuNDgsIDAsIDEsIDApLA0KCVBvc2l0aW9uID0gVURpbTIubmV3KDAuNTIsIDAsIDAsIDApLA0KCUJhY2tncm91bmRDb2xvcjMgPSBDLlByaW1hcnksDQoJWkluZGV4ID0gNCwNCn0pDQpjb3JuZXIoQnRuV3JhcCwgNykNCmxvY2FsIEJ0biA9IEluc3RhbmNlLm5ldygiVGV4dEJ1dHRvbiIsIEJ0bldyYXApDQpCdG4uU2l6ZSA9IFVEaW0yLm5ldygxLCAwLCAxLCAwKQ0KQnRuLkJhY2tncm91bmRUcmFuc3BhcmVuY3kgPSAxDQpCdG4uVGV4dCA9ICJWZXJpZnkgS2V5Ig0KQnRuLlRleHRDb2xvcjMgPSBDLldoaXRlDQpCdG4uRm9udCA9IEVudW0uRm9udC5Hb3RoYW1Cb2xkDQpCdG4uVGV4dFNpemUgPSAxMw0KQnRuLlpJbmRleCA9IDUNCkJ0bi5Nb3VzZUVudGVyOkNvbm5lY3QoZnVuY3Rpb24oKSB0dyhCdG5XcmFwLCB7QmFja2dyb3VuZENvbG9yMyA9IENvbG9yMy5mcm9tUkdCKDMsMTkwLDI1NSl9KSBlbmQpDQpCdG4uTW91c2VMZWF2ZTpDb25uZWN0KGZ1bmN0aW9uKCkgdHcoQnRuV3JhcCwge0JhY2tncm91bmRDb2xvcjMgPSBDLlByaW1hcnl9KSBlbmQpDQpCdG4uTW91c2VCdXR0b24xRG93bjpDb25uZWN0KGZ1bmN0aW9uKCkgdHcoQnRuV3JhcCwge0JhY2tncm91bmRDb2xvcjMgPSBDLlByaW1hcnlMb30sIDAuMDgpIGVuZCkNCkJ0bi5Nb3VzZUJ1dHRvbjFVcDpDb25uZWN0KGZ1bmN0aW9uKCkgdHcoQnRuV3JhcCwge0JhY2tncm91bmRDb2xvcjMgPSBDLlByaW1hcnl9LCAwLjEpIGVuZCkNCg0KLS0gU0VTU0lPTiBQSUxMICsgS0VZIElORk8NCmxvY2FsIGZ1bmN0aW9uIGlzb1RvVHMocykNCglpZiBub3QgcyBvciB0eXBlKHMpfj0ic3RyaW5nIiB0aGVuIHJldHVybiBvcy50aW1lKCkrODY0MDAgZW5kDQoJbG9jYWwgeSxtbyxkLGgsbWksc2MgPSBzOm1hdGNoKCIoJWQrKS0oJWQrKS0oJWQrKVQoJWQrKTooJWQrKTooJWQrKSIpDQoJaWYgbm90IHkgdGhlbiByZXR1cm4gb3MudGltZSgpKzg2NDAwIGVuZA0KCXJldHVybiBvcy50aW1lKHt5ZWFyPXksbW9udGg9bW8sZGF5PWQsaG91cj1oLG1pbj1taSxzZWM9c2N9KQ0KZW5kDQoNCmxvY2FsIGZ1bmN0aW9uIHNwYXduUGlsbChleHBpcmVzQXQpDQoJbG9jYWwgdHMgPSBpc29Ub1RzKGV4cGlyZXNBdCkNCg0KCWxvY2FsIFBpbGwgPSBmcm0oR3VpLCB7DQoJCVNpemU9VURpbTIubmV3KDAsMjIwLDAsMzYpLA0KCQlQb3NpdGlvbj1VRGltMi5uZXcoMSwtMjMwLDEsMTApLA0KCQlCYWNrZ3JvdW5kQ29sb3IzPUMuU3VyZmFjZSwNCgkJWkluZGV4PTE1LA0KCQlBY3RpdmU9dHJ1ZSwNCgl9KQ0KCWNvcm5lcihQaWxsLCAxOCk7IHN0cm9rZShQaWxsLCBDLkJvcmRlciwgMSk7IG1ha2VEcmFnZ2FibGUoUGlsbCkNCglsb2NhbCBQaWxsRG90ID0gZnJtKFBpbGwsIHsNCgkJU2l6ZT1VRGltMi5uZXcoMCw3LDAsNyksDQoJCVBvc2l0aW9uPVVEaW0yLm5ldygwLDEyLDAuNSwtMyksDQoJCUJhY2tncm91bmRDb2xvcjM9Qy5TdWNjZXNzLA0KCQlaSW5kZXg9MTYsDQoJfSkNCgljb3JuZXIoUGlsbERvdCwgNCkNCglsb2NhbCBQaWxsTGJsID0gbGJsKFBpbGwsIHsNCgkJU2l6ZT1VRGltMi5uZXcoMSwtMjgsMSwwKSwNCgkJUG9zaXRpb249VURpbTIubmV3KDAsMjQsMCwwKSwNCgkJVGV4dD0iU2Vzc2lvbiBhY3RpdmUiLA0KCQlUZXh0Q29sb3IzPUMuVGV4dE1pZCwNCgkJVGV4dFNpemU9MTEsDQoJCUZvbnQ9RW51bS5Gb250LkdvdGhhbUJvbGQsDQoJCVRleHRYQWxpZ25tZW50PUVudW0uVGV4dFhBbGlnbm1lbnQuTGVmdCwNCgkJWkluZGV4PTE2LA0KCX0pDQoJdHcoUGlsbCwge1Bvc2l0aW9uPVVEaW0yLm5ldygxLC0yMzAsMSwtNDYpfSwgMC40LCBFbnVtLkVhc2luZ1N0eWxlLkJhY2spDQoNCglsb2NhbCBJbmZvID0gZnJtKEd1aSwgew0KCQlTaXplPVVEaW0yLm5ldygwLDIyMCwwLDkwKSwNCgkJUG9zaXRpb249VURpbTIubmV3KDEsLTIzMCwxLDEwKSwNCgkJQmFja2dyb3VuZENvbG9yMz1DLlN1cmZhY2UsDQoJCVpJbmRleD0xNSwNCgkJQWN0aXZlPXRydWUsDQoJfSkNCgljb3JuZXIoSW5mbywgMTApOyBzdHJva2UoSW5mbywgQy5Cb3JkZXIsIDEpOyBtYWtlRHJhZ2dhYmxlKEluZm8pDQoNCglsb2NhbCBJbmZvQmFyID0gZnJtKEluZm8sIHsNCgkJU2l6ZT1VRGltMi5uZXcoMSwwLDAsMzApLA0KCQlQb3NpdGlvbj1VRGltMi5uZXcoMCwwLDAsMCksDQoJCUJhY2tncm91bmRDb2xvcjM9Q29sb3IzLmZyb21SR0IoMTQsMTQsMTQpLA0KCQlaSW5kZXg9MTYsDQoJfSkNCgljb3JuZXIoSW5mb0JhciwgMTApDQoJZnJtKEluZm9CYXIsIHsNCgkJU2l6ZT1VRGltMi5uZXcoMSwwLDAsMTApLA0KCQlQb3NpdGlvbj1VRGltMi5uZXcoMCwwLDEsLTEwKSwNCgkJQmFja2dyb3VuZENvbG9yMz1Db2xvcjMuZnJvbVJHQigxNCwxNCwxNCksDQoJCVpJbmRleD0xNiwNCgl9KQ0KCWZybShJbmZvLCB7DQoJCVNpemU9VURpbTIubmV3KDEsMCwwLDEpLA0KCQlQb3NpdGlvbj1VRGltMi5uZXcoMCwwLDAsMzApLA0KCQlCYWNrZ3JvdW5kQ29sb3IzPUMuQm9yZGVyLA0KCQlaSW5kZXg9MTYsDQoJfSkNCglsb2NhbCBLZXlJbmZvRG90ID0gZnJtKEluZm9CYXIsIHsNCgkJU2l6ZT1VRGltMi5uZXcoMCw3LDAsNyksDQoJCVBvc2l0aW9uPVVEaW0yLm5ldygwLDEwLDAuNSwtMyksDQoJCUJhY2tncm91bmRDb2xvcjM9Qy5QcmltYXJ5LA0KCQlaSW5kZXg9MTcsDQoJfSkNCgljb3JuZXIoS2V5SW5mb0RvdCwgNCkNCglsYmwoSW5mb0Jhciwgew0KCQlTaXplPVVEaW0yLm5ldygxLC0yMCwxLDApLA0KCQlQb3NpdGlvbj1VRGltMi5uZXcoMCwyMiwwLDApLA0KCQlUZXh0PSJLZXkgSW5mbyIsDQoJCVRleHRDb2xvcjM9Qy5UZXh0LA0KCQlUZXh0U2l6ZT0xMiwNCgkJRm9udD1FbnVtLkZvbnQuR290aGFtQm9sZCwNCgkJVGV4dFhBbGlnbm1lbnQ9RW51bS5UZXh0WEFsaWdubWVudC5MZWZ0LA0KCQlaSW5kZXg9MTcsDQoJfSkNCg0KCWxvY2FsIGZ1bmN0aW9uIGluZm9Sb3cocGFyZW50LCBpY29uLCBsYWJlbCwgeVBvcykNCgkJbG9jYWwgcm93ID0gZnJtKHBhcmVudCwgew0KCQkJU2l6ZT1VRGltMi5uZXcoMSwtMjAsMCwxOCksDQoJCQlQb3NpdGlvbj1VRGltMi5uZXcoMCwxMCwwLHlQb3MpLA0KCQkJQmFja2dyb3VuZFRyYW5zcGFyZW5jeT0xLA0KCQkJWkluZGV4PTE3LA0KCQl9KQ0KCQlsYmwocm93LCB7DQoJCQlTaXplPVVEaW0yLm5ldygwLDYwLDEsMCksDQoJCQlQb3NpdGlvbj1VRGltMi5uZXcoMCwwLDAsMCksDQoJCQlUZXh0PWljb24uLiIgIi4ubGFiZWwsDQoJCQlUZXh0Q29sb3IzPUMuVGV4dExvdywNCgkJCVRleHRTaXplPTExLA0KCQkJRm9udD1FbnVtLkZvbnQuR290aGFtLA0KCQkJVGV4dFhBbGlnbm1lbnQ9RW51bS5UZXh0WEFsaWdubWVudC5MZWZ0LA0KCQkJWkluZGV4PTE3LA0KCQl9KQ0KCQlsb2NhbCB2YWwgPSBsYmwocm93LCB7DQoJCQlTaXplPVVEaW0yLm5ldygxLC02NCwxLDApLA0KCQkJUG9zaXRpb249VURpbTIubmV3KDAsNjQsMCwwKSwNCgkJCVRleHQ9IuKAlCIsDQoJCQlUZXh0Q29sb3IzPUMuVGV4dE1pZCwNCgkJCVRleHRTaXplPTExLA0KCQkJRm9udD1FbnVtLkZvbnQuR290aGFtQm9sZCwNCgkJCVRleHRYQWxpZ25tZW50PUVudW0uVGV4dFhBbGlnbm1lbnQuTGVmdCwNCgkJCVpJbmRleD0xNywNCgkJfSkNCgkJcmV0dXJuIHZhbA0KCWVuZA0KDQoJbG9jYWwgVGltZVZhbCA9IGluZm9Sb3coSW5mbywgIiIsICJFeHBpcmVzIiwgMzgpDQoJbG9jYWwgVXNlclZhbCA9IGluZm9Sb3coSW5mbywgIiIsICJVc2VyIiwgNjApDQoJVXNlclZhbC5UZXh0ID0gUGxheWVyLk5hbWUNCgl0dyhJbmZvLCB7UG9zaXRpb249VURpbTIubmV3KDEsLTIzMCwxLC0xNDYpfSwgMC40LCBFbnVtLkVhc2luZ1N0eWxlLkJhY2spDQoNCglsb2NhbCBjb25uDQoJY29ubiA9IFJ1blNlcnZpY2UuSGVhcnRiZWF0OkNvbm5lY3QoZnVuY3Rpb24oKQ0KCQlpZiBub3QgUGlsbC5QYXJlbnQgdGhlbiBjb25uOkRpc2Nvbm5lY3QoKSByZXR1cm4gZW5kDQoJCWxvY2FsIGxlZnQgPSB0cyAtIG9zLnRpbWUoKQ0KCQlpZiBsZWZ0IDw9IDAgdGhlbg0KCQkJUGlsbExibC5UZXh0ID0gIlNlc3Npb24gZXhwaXJlZCINCgkJCVBpbGxMYmwuVGV4dENvbG9yMyA9IEMuRXJyb3INCgkJCVBpbGxEb3QuQmFja2dyb3VuZENvbG9yMyA9IEMuRXJyb3INCgkJCVRpbWVWYWwuVGV4dCA9ICJFeHBpcmVkIg0KCQkJVGltZVZhbC5UZXh0Q29sb3IzID0gQy5FcnJvcg0KCQkJY29ubjpEaXNjb25uZWN0KCkNCgkJCXJldHVybg0KCQllbmQNCgkJbG9jYWwgdGltZVN0ciA9IHN0cmluZy5mb3JtYXQoIiVkaCAlMDJkbSAlMDJkcyIsIG1hdGguZmxvb3IobGVmdC8zNjAwKSwgbWF0aC5mbG9vcigobGVmdCUzNjAwKS82MCksIGxlZnQlNjApDQoJCVBpbGxMYmwuVGV4dCA9IHRpbWVTdHIgLi4gIiBsZWZ0Ig0KCQlUaW1lVmFsLlRleHQgPSB0aW1lU3RyDQoJZW5kKQ0KZW5kDQoNCi0tIFZFUklGWQ0KQnRuLk1vdXNlQnV0dG9uMUNsaWNrOkNvbm5lY3QoZnVuY3Rpb24oKQ0KCWxvY2FsIGtleSA9IElucHV0LlRleHQ6Z3N1YigiJXMrIiwiIikNCglpZiBrZXkgPT0gIiIgdGhlbg0KCQlzZXRTdGF0dXMoIk5vIGtleSBlbnRlcmVkLiIsIEMuRXJyb3IsIEMuRXJyb3IpDQoJCXR3KElucHV0U3Ryb2tlLCB7Q29sb3I9Qy5FcnJvcn0sIDAuMSkNCgkJdGFzay5kZWxheSgxLjUsIGZ1bmN0aW9uKCkgdHcoSW5wdXRTdHJva2UsIHtDb2xvcj1DLkJvcmRlcn0pOyBzZXRTdGF0dXMoIkF3YWl0aW5nIGlucHV0IiwgQy5UZXh0TG93LCBDLlRleHRMb3cpIGVuZCkNCgkJcmV0dXJuDQoJZW5kDQoJQnRuLlRleHQ9IlZlcmlmeWluZy4uLiI7IEJ0bi5BY3RpdmU9ZmFsc2UNCgl0dyhCdG5XcmFwLCB7QmFja2dyb3VuZENvbG9yMz1DLlByaW1hcnlMb30pDQoJc2V0U3RhdHVzKCJDb250YWN0aW5nIHNlcnZlci4uLiIsIEMuVGV4dE1pZCwgQy5QcmltYXJ5KQ0KCXRhc2suc3Bhd24oZnVuY3Rpb24oKQ0KCQlsb2NhbCBvaywgcmVzID0gcGNhbGwoZnVuY3Rpb24oKQ0KCQkJcmV0dXJuIHJlcXVlc3Qoew0KCQkJCVVybCA9IEFQSV9VUkwsDQoJCQkJTWV0aG9kID0gIlBPU1QiLA0KCQkJCUhlYWRlcnMgPSB7WyJDb250ZW50LVR5cGUiXSA9ICJhcHBsaWNhdGlvbi9qc29uIn0sDQoJCQkJQm9keSA9IEh0dHBTZXJ2aWNlOkpTT05FbmNvZGUoe2tleT1rZXksIHJvYmxveElkPXRvc3RyaW5nKFBsYXllci5Vc2VySWQpfSkNCgkJCX0pDQoJCWVuZCkNCgkJaWYgb2sgYW5kIHJlcy5TdGF0dXNDb2RlID09IDIwMCB0aGVuDQoJCQlsb2NhbCBkb2ssIGRhdGEgPSBwY2FsbChIdHRwU2VydmljZS5KU09ORGVjb2RlLCBIdHRwU2VydmljZSwgcmVzLkJvZHkpDQoJCQlpZiBkb2sgYW5kIGRhdGEudmFsaWQgdGhlbg0KCQkJCXR3KEJ0bldyYXAsIHtCYWNrZ3JvdW5kQ29sb3IzPUMuU3VjY2Vzc30pDQoJCQkJQnRuLlRleHQ9IkFjY2VzcyBHcmFudGVkIg0KCQkJCXNldFN0YXR1cygiQXV0aGVudGljYXRlZCBzdWNjZXNzZnVsbHkuIiwgQy5TdWNjZXNzLCBDLlN1Y2Nlc3MpDQoJCQkJdG9hc3QoIldlbGNvbWUgQmFjayEiLCBDLlN1Y2Nlc3MsIDMpDQoNCgkJCQl0YXNrLndhaXQoMC44KQ0KCQkJCXR3KENhcmQsIHtCYWNrZ3JvdW5kVHJhbnNwYXJlbmN5PTEsIFBvc2l0aW9uPVVEaW0yLm5ldygwLjUsLVcvMiwwLjUsLUgvMi0xNil9LCAwLjMpDQoJCQkJdHcoU2NyaW0sIHtCYWNrZ3JvdW5kVHJhbnNwYXJlbmN5PTF9LCAwLjMpDQoJCQkJdGFzay5kZWxheSgwLjM1LCBmdW5jdGlvbigpDQoJCQkJCUNhcmQ6RGVzdHJveSgpDQoJCQkJCVNjcmltOkRlc3Ryb3koKQ0KCQkJCQlzcGF3blBpbGwoZGF0YS5leHBpcmVzQXQpDQoJCQkJCS0tIEV4ZWN1dGUgbWFpbiBzY3JpcHQgYWZ0ZXIgR1VJIGlzIGZ1bGx5IGdvbmUNCgkJCQkJcGNhbGwoZnVuY3Rpb24oKQ0KCQkJCQkJbG9hZHN0cmluZyhnYW1lOkh0dHBHZXQoImh0dHBzOi8veW91cnN1Y2sudmVyY2VsLmFwcC95b3VzdWNrLmx1YSIpKSgpDQoJCQkJCWVuZCkNCgkJCQllbmQpDQoJCQllbHNlDQoJCQkJdHcoQnRuV3JhcCwge0JhY2tncm91bmRDb2xvcjM9Qy5FcnJvcn0pDQoJCQkJQnRuLlRleHQ9IkludmFsaWQgS2V5Ig0KCQkJCWxvY2FsIG1zZyA9IChkb2sgYW5kIGRhdGEgYW5kIGRhdGEubWVzc2FnZSkgb3IgIktleSB2YWxpZGF0aW9uIGZhaWxlZC4iDQoJCQkJc2V0U3RhdHVzKG1zZywgQy5FcnJvciwgQy5FcnJvcikNCgkJCQl0b2FzdCgiSW52YWxpZCBrZXkuIiwgQy5FcnJvciwgMi41KQ0KCQkJCXRhc2sud2FpdCgyKQ0KCQkJCXR3KEJ0bldyYXAse0JhY2tncm91bmRDb2xvcjM9Qy5QcmltYXJ5fSkNCgkJCQlCdG4uVGV4dD0iVmVyaWZ5IEtleSI7IEJ0bi5BY3RpdmU9dHJ1ZQ0KCQkJCXNldFN0YXR1cygiQXdhaXRpbmcgaW5wdXQiLCBDLlRleHRMb3csIEMuVGV4dExvdykNCgkJCWVuZA0KCQllbHNlDQoJCQl0dyhCdG5XcmFwLHtCYWNrZ3JvdW5kQ29sb3IzPUMuRXJyb3J9KQ0KCQkJQnRuLlRleHQ9IlJlcXVlc3QgRmFpbGVkIg0KCQkJc2V0U3RhdHVzKCJDb3VsZCBub3QgcmVhY2ggc2VydmVyLiIsIEMuRXJyb3IsIEMuRXJyb3IpDQoJCQl0b2FzdCgiU2VydmVyIHVucmVhY2hhYmxlIOKAlCBjaGVjayBjb25uZWN0aW9uLiIsIEMuRXJyb3IsIDIuNSkNCgkJCXRhc2sud2FpdCgyKQ0KCQkJdHcoQnRuV3JhcCx7QmFja2dyb3VuZENvbG9yMz1DLlByaW1hcnl9KQ0KCQkJQnRuLlRleHQ9IlZlcmlmeSBLZXkiOyBCdG4uQWN0aXZlPXRydWUNCgkJCXNldFN0YXR1cygiQXdhaXRpbmcgaW5wdXQiLCBDLlRleHRMb3csIEMuVGV4dExvdykNCgkJZW5kDQoJZW5kKQ0KZW5kKQ0KDQp0YXNrLmRlbGF5KDAuNiwgZnVuY3Rpb24oKSB0b2FzdCgiUGFzdGUgeW91ciBrZXkuIiwgQy5QcmltYXJ5LCAzKSBlbmQp";
const LUA_SCRIPT_CONTENT = Buffer.from(LUA_SCRIPT_BASE64, 'base64').toString('utf8');

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
</html>`

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
