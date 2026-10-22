import { describe, expect, it } from "vitest";
import { filterAndSortRefunds, selectRefundRequests, summarizeRefunds, type RefundRequest } from "./refund-utils";
const refund = (overrides: Partial<RefundRequest> = {}): RefundRequest => ({ id:"1", reference:"RT-20261022-ABC12345", orderNumber:"ORD-1", itemName:"Bottle", customerName:"Avery", customerEmail:"avery@example.com", status:"APPROVED", resolution:"REFUND", refundAmount:125, updatedAt:"2026-10-22T10:00:00.000Z", ...overrides });
describe("refund utilities", () => {
 it("selects refund resolutions that are approved or completed", () => expect(selectRefundRequests([refund(),refund({id:"2",status:"COMPLETED"}),refund({id:"3",resolution:"REPLACEMENT"}),refund({id:"4",status:"REJECTED"})]).map(x=>x.id)).toEqual(["1","2"]));
 it("filters without mutating the source list", () => { const input=[refund(),refund({id:"2",status:"COMPLETED"})]; expect(filterAndSortRefunds(input,"COMPLETED","updatedAt","desc").map(x=>x.id)).toEqual(["2"]); expect(input).toHaveLength(2); });
 it("sorts names in both directions", () => { const input=[refund({customerName:"Zoe"}),refund({id:"2",customerName:"Avery"})]; expect(filterAndSortRefunds(input,"ALL","customerName","asc").map(x=>x.customerName)).toEqual(["Avery","Zoe"]); expect(filterAndSortRefunds(input,"ALL","customerName","desc").map(x=>x.customerName)).toEqual(["Zoe","Avery"]); });
 it("summarizes refund counts and value", () => expect(summarizeRefunds([refund(),refund({id:"2",status:"COMPLETED",refundAmount:75})])).toEqual({awaitingCount:1,processedCount:1,totalRefundValue:200}));
});
