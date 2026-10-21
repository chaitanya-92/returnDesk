import { PrismaClient, RequestEventType, RequestStatus, ResolutionType } from "@prisma/client";

const prisma = new PrismaClient();

const samples = [
  ["Avery Johnson","avery.johnson@example.com","RT-Seed-001","ORD-52001","ITEM-52001-A","Everyday Bottle 750 ml","BOT-750-OLV","DAMAGED","The bottle arrived with a dent near the lid.",RequestStatus.OPEN],
  ["Noah Williams","noah.williams@example.com","RT-Seed-002","ORD-52002","ITEM-52002-A","Trail Backpack 22L","BAG-22-BLK","WRONG_SIZE","The backpack is smaller than the size guide suggested.",RequestStatus.IN_REVIEW],
  ["Mia Patel","mia.patel@example.com","RT-Seed-003","ORD-52003","ITEM-52003-A","Insulated Mug 350 ml","MUG-350-SND","CHANGED_MIND","The colour did not match my desk setup.",RequestStatus.APPROVED],
  ["Ethan Brooks","ethan.brooks@example.com","RT-Seed-004","ORD-52004","ITEM-52004-A","Travel Pouch Set","POUCH-3-NVY","MISSING_PARTS","One pouch is missing from the set.",RequestStatus.REJECTED],
  ["Sofia Garcia","sofia.garcia@example.com","RT-Seed-005","ORD-52005","ITEM-52005-A","Everyday Bottle 1 L","BOT-1L-SGE","NOT_AS_DESCRIBED","The listed capacity does not match the label.",RequestStatus.COMPLETED],
  ["Liam Chen","liam.chen@example.com","RT-Seed-006","ORD-52006","ITEM-52006-A","Lunch Container","LUNCH-700-GRN","DAMAGED","The latch broke during delivery.",RequestStatus.OPEN],
  ["Olivia Martin","olivia.martin@example.com","RT-Seed-007","ORD-52007","ITEM-52007-A","Commuter Tote","TOTE-COM-BLK","WRONG_ITEM","Received a different style than ordered.",RequestStatus.IN_REVIEW],
  ["Lucas Wilson","lucas.wilson@example.com","RT-Seed-008","ORD-52008","ITEM-52008-A","Packable Rain Jacket","JKT-RN-M","WRONG_SIZE","The fit runs too small.",RequestStatus.APPROVED],
  ["Isabella Moore","isabella.moore@example.com","RT-Seed-009","ORD-52009","ITEM-52009-A","Ceramic Travel Cup","CUP-CER-WHT","DAMAGED","The handle was cracked when unpacked.",RequestStatus.OPEN],
  ["James Taylor","james.taylor@example.com","RT-Seed-010","ORD-52010","ITEM-52010-A","Desk Organizer","ORG-DSK-OAK","CHANGED_MIND","I no longer need this item.",RequestStatus.COMPLETED],
  ["Amara Singh","amara.singh@example.com","RT-Seed-011","ORD-52011","ITEM-52011-A","Weekender Duffel","DUF-WKD-32","NOT_AS_DESCRIBED","The material feels different from the product page.",RequestStatus.IN_REVIEW],
  ["Benjamin Clark","ben.clark@example.com","RT-52012","ORD-52012","ITEM-52012-A","Reusable Cutlery Kit","CUT-KIT-SS","MISSING_PARTS","The travel case was missing.",RequestStatus.OPEN],
  ["Ella Thompson","ella.thompson@example.com","RT-52013","ORD-52013","ITEM-52013-A","Thermal Lunch Bag","BAG-LUNCH-THERM","WRONG_ITEM","This is the wrong colour.",RequestStatus.REJECTED],
  ["Mateo Rivera","mateo.rivera@example.com","RT-52014","ORD-52014","ITEM-52014-A","Packing Cubes Set","CUBE-SET-6","CHANGED_MIND","The set is larger than I expected.",RequestStatus.COMPLETED],
  ["Zara Khan","zara.khan@example.com","RT-52015","ORD-52015","ITEM-52015-A","Stainless Straw Set","STRAW-SS-4","MISSING_PARTS","Only two straws were included.",RequestStatus.OPEN],
  ["Henry Adams","henry.adams@example.com","RT-52016","ORD-52016","ITEM-52016-A","Travel Pillow","PIL-TRV-GRY","DAMAGED","The seam is open on arrival.",RequestStatus.IN_REVIEW],
  ["Grace Lee","grace.lee@example.com","RT-52017","ORD-52017","ITEM-52017-A","Foldable Shopping Tote","TOTE-FOLD-RED","WRONG_SIZE","The bag is smaller than listed.",RequestStatus.APPROVED],
  ["Daniel Scott","daniel.scott@example.com","RT-52018","ORD-52018","ITEM-52018-A","Glass Food Jar","JAR-GLS-500","DAMAGED","The glass was shattered inside the box.",RequestStatus.OPEN],
  ["Chloe Evans","chloe.evans@example.com","RT-52019","ORD-52019","ITEM-52019-A","Waterproof Phone Sleeve","SLEEVE-WP","NOT_AS_DESCRIBED","The touch panel is not responsive.",RequestStatus.REJECTED],
  ["Arjun Desai","arjun.desai@example.com","RT-52020","ORD-52020","ITEM-52020-A","Compact Umbrella","UMB-CMP-NVY","WRONG_ITEM","A different model was delivered.",RequestStatus.COMPLETED],
  ["Ruby Mitchell","ruby.mitchell@example.com","RT-52021","ORD-52021","ITEM-52021-A","Mini First Aid Kit","KIT-FIRST-AID","MISSING_PARTS","The bandage pouch is missing.",RequestStatus.OPEN],
  ["Owen Baker","owen.baker@example.com","RT-52022","ORD-52022","ITEM-52022-A","Bottle Sling","SLING-BTL-BLK","CHANGED_MIND","It does not fit the bottle I own.",RequestStatus.IN_REVIEW],
  ["Anaya Joshi","anaya.joshi@example.com","RT-52023","ORD-52023","ITEM-52023-A","Packing Organizer","ORG-PACK-M","WRONG_SIZE","The compartments are too small.",RequestStatus.APPROVED],
  ["Jack Murphy","jack.murphy@example.com","RT-52024","ORD-52024","ITEM-52024-A","Compact Coffee Press","PRESS-COF-350","DAMAGED","The plunger arrived bent.",RequestStatus.OPEN],
  ["Leila Hassan","leila.hassan@example.com","RT-52025","ORD-52025","ITEM-52025-A","Travel Cutlery Case","CASE-CUT-TRV","NOT_AS_DESCRIBED","The case does not close securely.",RequestStatus.COMPLETED],
  ["Samuel Reed","sam.reed@example.com","RT-52026","ORD-52026","ITEM-52026-A","Quick Dry Towel","TOWEL-QD-L","WRONG_ITEM","The ordered large towel was replaced with small.",RequestStatus.IN_REVIEW],
  ["Priya Nair","priya.nair@example.com","RT-52027","ORD-52027","ITEM-52027-A","Insulated Food Flask","FLASK-FOOD-600","DAMAGED","The cap leaks when closed.",RequestStatus.OPEN],
  ["David Foster","david.foster@example.com","RT-52028","ORD-52028","ITEM-52028-A","Cable Organizer Roll","ROLL-CABLE-GRY","MISSING_PARTS","Several elastic loops are not stitched.",RequestStatus.REJECTED],
  ["Mei Zhang","mei.zhang@example.com","RT-52029","ORD-52029","ITEM-52029-A","Travel Jewelry Case","CASE-JWL-SGE","CHANGED_MIND","I chose a different size.",RequestStatus.COMPLETED],
  ["Kabir Mehta","kabir.mehta@example.com","RT-52030","ORD-52030","ITEM-52030-A","Foldable Laptop Stand","STAND-LAP-ALU","NOT_AS_DESCRIBED","It does not fit the laptop model listed.",RequestStatus.OPEN],
];

async function main() {
  for (let i = 0; i < samples.length; i++) {
    const [customerName, customerEmail, reference, orderNumber, orderItemId, itemName, itemSku, reason, description, status] = samples[i] as [string,string,string,string,string,string,string,string,string,RequestStatus];
    const resolution = status === RequestStatus.APPROVED || status === RequestStatus.COMPLETED
      ? (i % 2 === 0 ? ResolutionType.REFUND : ResolutionType.REPLACEMENT)
      : null;
    await prisma.returnRequest.upsert({
      where: { reference },
      update: {},
      create: {
        customerName, customerEmail, reference, orderNumber, orderItemId, itemName, itemSku,
        reason, description, status, quantity: 1,
        ...(resolution ? { resolution, ...(resolution === ResolutionType.REFUND ? { refundAmount: 24.95 + i } : {}) } : {}),
        createdAt: new Date(Date.now() - i * 5 * 60 * 60 * 1000),
        notes: { create: [{ body: status === RequestStatus.OPEN ? "Request received; awaiting initial review." : "Sample case created for workflow testing.", author: "Seed data" }] },
        events: { create: [{ type: RequestEventType.CREATED, message: "Seeded sample request." }] },
      },
    });
  }
  console.log(`Seeded ${samples.length} return request records.`);
}

main().finally(async () => prisma.$disconnect());
