window.__APP_CONFIG__ = (() => {
  const host = window.location.hostname || "localhost";
  const isIngressHost = host.endsWith(".devops.local");

  return {
    API_ORDERS: isIngressHost ? "/orders" : `http://${host}:8050`,
    API_PRODUCTS: isIngressHost ? "/products" : `http://${host}:8070`
  };
})();
