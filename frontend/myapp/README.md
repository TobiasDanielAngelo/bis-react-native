Logs

November 30, 2023
Next update: December 2, 2023

1. Changed description for adding petty coins. Manually change description until next update.
2. Found some input error for posting check payment. Manually change transaction date to due date of check until next update.
3. Add an update to auto-refresh. Make sure that to not overfetch everything.
4. Manually update beginning balance by changing UNTRACKED to INITIAL once the next update commences. Hide all entries named INITIAL in dropdown (except at Transfer >> "From"). Also in frontend, in fetching account balances under "TOTAL", make sure to filter the INITIAL.
5. Create a tally sheet for Cash box. (OK)
6. Create a dollar account for the next update.
7. For Product model, add a user_adder and datetime_added stats.
8. [Urgent] Create backups and make a desktop site.'
9. Reloading sales did not update the if sale is !is_active (OK).
10. Bring back change for expenses. (OK)
11. Be careful comparing floats!
12. Creating a new sale will set customer to its id. (OK)
13. Create a different submit button for cash/coins in Sales >> Balance. (OK)
14. Bug found in editing labor (OK).
15. Indicate Sales #. (OK)
16. Edit product using Inventory >> Check. (OK)
17. Payment/(Transaction related to Sales) not updating after reload. Change the serializer for Sales' payment. (Not an issue)
18. Close button in Sales Status bar shows in privilege=1 (should not be the case). (OK)
19. After closing a transaction, set to_print = False. (OK)
20. SearchResultList not closing after modes bar is closed (Product Update).
21. [Note] Multiple sources of user errors might lead to app dysfunction.
22. If the labor has been claimed by the mechanic but the cashier "accidentally" removed the payment, the Settle tab might think you need to redo your settlement to the mechanic.
23. Updating a price while using toMoney in useEffect might be unusable for prices > 1000. Change the toMoney algo. (OK)
24. Remove from Analytics the unclaimed for DATS. (OK)
25. Enlarge Bills and Coins labels. (OK)
26. Balance submodule might be confusing. (OK)
27. Make comments and names optional. (OK)
28. Cash adjustments must keep separate.
29. Add Untracked to Expense Module. (OK)
30. Add a feature in Edit for editing selling prices (on Check).

December 2, 2023

1. Review of Sales navigating in date not showing any sales. (OK)
2. Major bug found in tallying. (OK)

December 3, 2023

1. Found some issues in adding an item in sales (Getting misplaced). (indexing?) Replicate by closing an item from first page then adding item in second page? Maybe the solution is to set order to -1 after closing. (OK)
2. In Timeline, find a way to add padding with the y-axis labels. (OK)
3. Change random name to Cash -> Cabanatuan City.
4. Create a print button in status bar for Sales > History (Temporarily make it active for editing). (OK)
5. Sort by latest from sales/expense/transfer/purchase histories.
6. Add date to receipt. (OK)

December 4, 2023

1. Closing the sale sets selected item to -1 which puts page number to -1, set it to 0. (OK)
2. Set default address to Cabanatuan. (OK)
3. Option to remove total - Print App.
4. Fetch missing products. (OK)
5. Show print counts for Check. (OK)

December 8, 2023

1. Added BNW and Code. (OK)
2. Case insensitive login. (OK)
3. Sort by date. (OK)
4. Fix subview clipping. (OK)

December 14, 2023

1. Create a placeholder for new item for order.
2. Add a Search functionality for order.
3. Fix subview clipping. (OK)

December 18, 2023

1. Create a network error flagging to notify user of unsucessful fetching. Also, fix UI bug where the frontend is updating before the actual backend change.
2. Do modify the json data received for the analytics.
3. Redefine numbers (ids) to enums.
4. For 'toProductShortName', do a DRY (send sparePartStore as arg). (OK)
5. The "motors" field in products should have been a ManyToManyField.
6. Documentation on how to use the app.
7. Preempt closing of customer (delete sale) if no items inline. (OK)
