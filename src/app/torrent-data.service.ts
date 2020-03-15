import { Injectable } from '@angular/core';
import { MainData } from 'src/utils/Interfaces';
import { Observable } from 'rxjs';

// Utils
import * as http_config from '../assets/http_config.json';
import { IsDevEnv } from 'src/utils/Environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TorrentDataService {

  private http_endpoints: any;

  constructor(private http: HttpClient) { this.http_endpoints = http_config.endpoints; }

  /** Get all torrent data from server
   * @param RID The rid key for changelogs. Set to 0 if you want all data instead of changes from previous.
   */
  GetAllTorrentData(RID: number): Observable<MainData> {
    
    let root = this.http_endpoints.root;
    let endpoint = this.http_endpoints.torrentList;
    let url = root + endpoint + `?rid=${RID}`;

    // Do not send cookies in dev mode
    let options = IsDevEnv() ? { } : { withCredentials: true }

    return this.http.get<MainData>(url, options);
  }

  /** Send batch of 1 or more torrents to server for enqueue.
   * @param files The files to upload.
   */
  async UploadNewTorrents(files: FileList[]): Promise<any> {
    let root = this.http_endpoints.root;
    let endpoint = this.http_endpoints.uploadTorrents;
    let url = root + endpoint;

    // Do not send cookies in dev mode
    let options = IsDevEnv() ? { } : { withCredentials: true, responseType: 'text', observe: 'response'}

    /** Upload each file individually
     * TODO: Send all files in batch
     */
    for(const file of files) {
      let result = await this.sendFile(file, url, options);
      console.log("Sent file: ", file);
      console.log("Got result: ", result);
    }
  }

  /** Delete a torrent.
   * @param hash The unique hash of the torrent.
   * @param deleteFromDisk If the files should be deleted as well (true), 
   * or if they should persist (false).
   */
  DeleteTorrent(hash: string, deleteFromDisk: boolean): Observable<any> {
    let root = this.http_endpoints.root;
    let endpoint = this.http_endpoints.deleteTorrent;
    let url = root + endpoint;

    // body parameters
    let body = new FormData();
    body.append("hashes", hash);
    body.append("deleteFiles", `${deleteFromDisk}`);

    // Do not send cookies in dev mode
    let options = IsDevEnv() ? { } : { withCredentials: true }

    return this.http.post(url, body, options);
  }

  private sendFile(file: any, endpoint: string, options: any): Promise<any> {
    return this.http.post(endpoint, file, options).toPromise();
  }
}
