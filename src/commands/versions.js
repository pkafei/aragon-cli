const Web3 = require('web3')
const findUp = require('find-up')
const { MessageError } = require('../errors')
const APM = require('../apm')

exports.command = 'versions'

exports.describe = 'List all versions of the package'

exports.handler = async function ({ reporter, module, bump, cwd, keyfile, ethRpc, apm: apmOptions }) {
  const web3 = new Web3(
    config.get(`${network}.rpc`, ethRpc)
  )

  const apm = await APM(
    web3,
    Object.assign(
      apmOptions, { ensRegistry: config.get(`${network}.ens`) }
    )
  )

  const moduleLocation = await findUp('arapp.json', { cwd })
  if (!moduleLocation) {
    throw new MessageError('This directory is not an Aragon project',
  'ERR_NOT_A_PROJECT')
  }

  return apm.getAllVersions(module.appName)
    .then((versions) => {
      reporter.info(`${module.appName} has ${versions.length} published versions`)
      versions.forEach((version) => {
        reporter.success(`${version.version}: ${version.contractAddress} ${version.content.provider}:${version.content.location}`)
      })
    })
}
