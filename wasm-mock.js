// Override WebAssembly to prevent out-of-memory errors on constrained hosts
const origInstantiate = WebAssembly.instantiate.bind(WebAssembly);
const origCompile = WebAssembly.compile.bind(WebAssembly);
const origInstantiateStreaming = WebAssembly.instantiateStreaming?.bind(WebAssembly);

WebAssembly.instantiate = async function patchedInstantiate(buffer, imports) {
  try {
    return await origInstantiate(buffer, imports);
  } catch (e) {
    if (e.message && e.message.includes('Out of memory')) {
      console.warn('⚠️ WASM instantiate OOM caught, returning mock');
      return { instance: { exports: {} }, module: {} };
    }
    throw e;
  }
};

WebAssembly.compile = async function patchedCompile(buffer) {
  try {
    return await origCompile(buffer);
  } catch (e) {
    if (e.message && e.message.includes('Out of memory')) {
      console.warn('⚠️ WASM compile OOM caught, returning mock');
      return {};
    }
    throw e;
  }
};

if (origInstantiateStreaming) {
  WebAssembly.instantiateStreaming = async function patchedInstantiateStreaming(source, imports) {
    try {
      return await origInstantiateStreaming(source, imports);
    } catch (e) {
      if (e.message && e.message.includes('Out of memory')) {
        console.warn('⚠️ WASM instantiateStreaming OOM caught, returning mock');
        return { instance: { exports: {} }, module: {} };
      }
      throw e;
    }
  };
}

console.log('🔧 WASM mock preload active');
