import { Application, Request, Response } from 'express'
import axios, { AxiosResponse } from 'axios'
import { Resolver } from 'did-resolver'
import { getResolver } from 'plc-did-resolver'
//import { getLinkPreview } from 'link-preview-js'
import fs from 'fs'
import * as crypto from "crypto";
function extensionFromMimeType(mime: string) {
  return mime.split('/').pop()?.replace('jpeg', 'jpg').replace('svg+xml', 'svg').replace('x-icon', 'ico') || ''
}

export default function cacheRoutes(app: Application) {
  app.get('/api/cache', async (req: Request, res: Response) => {
    let mediaUrl = String(req.query?.media)
    const avatarTransform = String(req.query?.avatar) === 'true'
    if (!mediaUrl) {
      res.sendStatus(404)
      return
    }

    try {
      if (mediaUrl.startsWith('?cid=')) {
        try {
          const did = decodeURIComponent(mediaUrl.split('&did=')[1])
          const cid = decodeURIComponent(mediaUrl.split('&did=')[0].split('?cid=')[1])
          if (!did || !cid) {
            return res.sendStatus(400)
          }
          const plcResolver = getResolver()
          const didResolver = new Resolver(plcResolver)
          const didData = await didResolver.resolve(did)
          if (didData?.didDocument?.service) {
            const url =
              didData.didDocument.service[0].serviceEndpoint +
              '/xrpc/com.atproto.sync.getBlob?did=' +
              encodeURIComponent(did) +
              '&cid=' +
              encodeURIComponent(cid)
            mediaUrl = url;
          }
        } catch (error) {
          return res.sendStatus(500)
        }
      }
      const {data}  = await axios.get(mediaUrl, {
              responseType: 'stream',
              headers: { 'User-Agent': 'wafrnCacher' }
            })

    data.pipe(res);

    } catch (error) {
      return res.sendStatus(500)
    }
  })

  
}
