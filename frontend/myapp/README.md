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
12. Creating a new sale will set customer to its id (to much work, prone to error).
13. Create a different submit button for cash/coins in Sales >> Balance.
14. Bug found in editing labor (OK).
15. Indicate Sales #. (OK)
16. Edit product using Inventory >> Check.
17. Payment/(Transaction related to Sales) not updating after reload. Change the serializer for Sales' payment. (Not an issue)
18. Close button in Sales Status bar shows in privilege=1 (should not be the case).
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

1. Review of Sales navigating in date not showing any sales.
2. Major bug found in tallying.

December 3, 2023

1. Found some issues in adding an item in sales. (indexing?) Replicate by closing an item from first page then adding item in second page? Maybe the solution is to set order to -1 after closing.
2. In Timeline, find a way to add padding with the y-axis labels.
3. Change random name to Cash -> Cabanatuan City
