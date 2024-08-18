import { Binary } from "binary-install";
import packageJson from "../package.json";
import os from "node:os";

function getPlatform() {
    const _type = os.type();
    const _arch = os.arch();

    const types = {
        "Windows_NT": "Windows",
        "Darwin": "Darwin",
        "Linux": "Linux"
    };

    const archs = {
        "x64": "x86_64",
        "arm64": "aarch64"
    };

    const type = types[_type];
    const arch = archs[_arch];

    const platform = `${type}-${arch}`;

    if (!type || !arch) throw new Error(`Unsupported platform: ${platform}`);

    return platform;
}

export function getBinary() {
    const version = packageJson.version;
    const platform = getPlatform();

    const url = `https://github.com/sapphiredev/cli/releases/download/v${version}/sapphire-${platform}.tar.gz`;
    const name = "sapphire";
    return new Binary(url, { name });
}
