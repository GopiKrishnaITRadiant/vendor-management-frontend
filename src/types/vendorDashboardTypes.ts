export type ActivityPeriod = "week" | "month" | "year";

export type DashboardStats = {
  openOrders: number;
  asnsSubmitted: number;
  pendingApproval: number;
  completedAllTime: number;
};

export type ASNActivity = {
  month: string;
  submitted: number;
  approved: number;
  rejected: number;
};

export type RecentAsnStatus =
  | "draft"
  | "submitted"
  | "confirmed"
  | "approved"
  | "rejected"
  | "shipped"
  | "delivered";


export type RecentAsn = {
  asnNumber: string;
  poNo: string;
  carrierName: string;
  status: RecentAsnStatus;
  statusLabel: string;
  createdAt: string;
};


export type Performance = {
  onTimeDelivery:number;
  asnApprovalRate:number;
  orderFulfilment:number;
};


export type VendorDashboardResponse = {
  success:boolean;
  message:string;
  data:{
    stats:DashboardStats;
    asnActivity:ASNActivity[];
    recentASNs:RecentAsn[];
    performance:Performance;
    activityPeriod:ActivityPeriod;
    approvalRate:number;
    totalSubmitted:number;
    totalApproved:number;
    totalRejected:number;
  };
};