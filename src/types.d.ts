export declare interface DriveListResponse {
  files?: ProjectedFile[];
  nextPageToken?: string;
}

export declare interface ProjectedFile {
  capabilities: FileCapabilities;
  createdTime: string;
  id: string;
  isAppAuthorized: boolean;
  name: string;
  shared: boolean;
  size: string;
  webViewLink: string;
}

export declare interface FileCapabilities {
  canDownload: boolean;
  canEdit: boolean;
}
