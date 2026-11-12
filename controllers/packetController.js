const Packet = require('../models/Packet')
const { isValidIPv4, isValidPacketId, isValidProtocol } = require('../utils/regexValidator')
const { classifyPacket, evaluateStatus } = require('../utils/automataClassifier')

exports.getPackets = async (req, res) => {
  try {
    const packets = await Packet.find().sort({ createdAt: -1 })
    res.status(200).json(packets)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching packets', error: error.message })
  }
}

exports.createPacket = async (req, res) => {
  try {
    const { packetId, sourceIp, destinationIp, protocol, size, status } = req.body

    if (!packetId || !sourceIp || !destinationIp) {
      return res.status(400).json({ message: 'packetId, sourceIp and destinationIp are required.' })
    }

    if (!isValidPacketId(packetId)) {
      return res.status(400).json({ message: 'Invalid packetId format.' })
    }

    if (!isValidIPv4(sourceIp) || !isValidIPv4(destinationIp)) {
      return res.status(400).json({ message: 'Source and destination IPs must be valid IPv4 addresses.' })
    }

    if (protocol && !isValidProtocol(protocol)) {
      return res.status(400).json({ message: 'Unsupported protocol.' })
    }

    const packet = await Packet.create({
      packetId,
      sourceIp,
      destinationIp,
      protocol: protocol || 'TCP',
      size: size || 0,
      status: status || evaluateStatus({ protocol: protocol || 'TCP', size: size || 0 }),
    })

    packet.classification = classifyPacket(packet)
    await packet.save()

    res.status(201).json(packet)
  } catch (error) {
    res.status(500).json({ message: 'Error creating packet', error: error.message })
  }
}
