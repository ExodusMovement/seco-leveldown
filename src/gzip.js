import zlib from 'zlib'

export function gzip (data) {
  return new Promise((resolve, reject) => zlib.gzip(data, (e, d) => {
    if (e) reject(e)
    else resolve(d)
  }))
}

export function gunzip (data) {
  return new Promise((resolve, reject) => zlib.gunzip(data, (e, d) => {
    if (e) reject(e)
    else resolve(d)
  }))
}
