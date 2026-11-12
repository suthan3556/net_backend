
// IPv4 address validation
const ipRegex =
  /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/;

// Validate IP address
function validateIP(ip) {
  return ipRegex.test(ip);
}

// Validate port number
function validatePort(port) {
  const number = Number(port);

  return (
    port !== "" &&
    Number.isInteger(number) &&
    number >= 1 &&
    number <= 65535
  );
}

// Validate packet fields
function validatePacket(packet) {
  const errors = [];

  if (!validateIP(packet.sourceIP)) {
    errors.push("Invalid Source IP Address");
  }

  if (!validateIP(packet.destinationIP)) {
    errors.push("Invalid Destination IP Address");
  }

  const protocol = String(packet.protocol || "").toUpperCase();

  if (!["TCP", "UDP", "ICMP"].includes(protocol)) {
    errors.push("Unsupported Protocol");
  }

  if (protocol === "TCP" || protocol === "UDP") {
    if (!validatePort(packet.port)) {
      errors.push("Port must be between 1 and 65535");
    }
  }

  if (protocol === "ICMP" && packet.port !== "" &&
      packet.port !== null && packet.port !== undefined) {
    errors.push("ICMP does not use port numbers");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = { validatePacket };
