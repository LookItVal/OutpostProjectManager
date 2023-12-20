// We should eventually unit test but maybe thats a task for when we migrate to TS

function testInitiativesConstructor() {
  try {
    var initiative = new Initiatives({name: 1});
  } catch (e) {
    assertEquals('Initiatives name must be a string.', e.message);
  }
}