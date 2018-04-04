const path = require('path')
const os = require('os')
const fs = require('fs-extra')
const dotprop = require('dot-prop')
const merge = require('deepmerge')

module.exports = function createConfig (
  configPath = path.resolve(process.cwd(), '.aragonrc')
) {
  let globalConfig = {}
  let localConfig = {}

  const globalConfigPath = path.resolve(os.homedir(), '.aragonrc')
  const globalConfigExists = fs.pathExistsSync(globalConfigPath)
  if (globalConfigExists) {
    globalConfig = fs.readJsonSync(globalConfigPath)
  }

  const localConfigExists = fs.pathExistsSync(configPath)
  if (localConfigExists) {
    localConfig = fs.readJsonSync(configPath)
  }

  const config = merge(
    globalConfig,
    localConfig
  )

  return {
    config,
    get: function (path, defaultValue = null) {
      return dotprop.get(
        this.config,
        path,
        defaultValue
      )
    }
  }
}
