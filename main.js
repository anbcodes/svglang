const fs = require('fs')
const file = fs.readFileSync(process.argv[2]).toString().replace("\\\n", " ")
const regex = /(?<all> (?<attr>.*?): (?<type>[`"])(?<value>.*?)[`"])/g
const regexForCommand = /((?<command>.*?) )/
let result;
const commands = []
file.split("\n").forEach(line => {
    const command = regexForCommand.exec(line).groups.command
    let attrs = []
    while ((result = regex.exec(line)) !== null) {
        attrs.push([result.groups.attr, result.groups.value, result.groups.type === '`' ? 'javascript' : 'string'])
    }
    commands.push([command, attrs])
})
let svg = []
commands.forEach(command => {
    let currentSvg = []
    let textAttr = false
    currentSvg.push(`<${command[0]}`)
    command[1].forEach(attr => {
        if (attr[0] == "text") {
            textAttr = attr[1]
            return
        }
        if (attr[2] === 'javascript') {
            currentSvg.push(` ${attr[0]}="(event) => ${attr[1]}"`)

        } else {
            currentSvg.push(` ${attr[0]}="${attr[1]}"`)
        }
    })
    currentSvg.push(`>${textAttr || ""}</${command[0]}>`)
    svg.push(currentSvg.join(""))
})
fs.writeFileSync(process.argv[3], svg.join("\n"))