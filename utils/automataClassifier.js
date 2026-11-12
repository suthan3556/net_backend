
// DFA for protocol classification

const transitions = {
  q0: { T: "q1", U: "q4", I: "q7" },
  q1: { C: "q2" },
  q2: { P: "q3" },
  q4: { D: "q5" },
  q5: { P: "q6" },
  q7: { C: "q8" },
  q8: { M: "q9" },
  q9: { P: "q10" }
};

const finalStates = {
  q3: "TCP",
  q6: "UDP",
  q10: "ICMP"
};

function classifyProtocol(protocol) {
  let state = "q0";

  const input = String(protocol || "").toUpperCase();

  for (const character of input) {
    if (!transitions[state] ||
        !transitions[state][character]) {
      return "UNKNOWN";
    }

    state = transitions[state][character];
  }

  return finalStates[state] || "UNKNOWN";
}

module.exports = { classifyProtocol };
