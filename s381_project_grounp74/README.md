Inventory-management

Group: 74
Name: 
Leung Pak hei(13430941),
Yeung Yiu Ming (13448839)



Login
Through the login interface, each user can access the restaurant information management system by entering their username and password.

Each user has a userID and password;
[
    {uid:"10001",name: "Peter Parker", password: "10001"},
  {uid:"20002",name: "Ken", password: "20002"},
  {uid:"30003",name: "Thomas", password: "30003"}

]

After successful login, userid is stored in seesion.

**
Logout
In the home page, each user can log out their account by clicking logout.

**
CRUD service
Create
A Inventory-management document may contain the following attributes with an example: 
1)     Item Name 
2)     itemID (00000003), item id 
3)    supplier
4)    itemQuantity


Create operation is post request, and all information is in body of request.

the service and restful part idk which ineed to write 

# CRUD service
- Read
-  You can click “find” on the main page to show all items
    - List item all date

- Create
  - In Find page ,you can click create to add item
  
- Update
  - In Find page,You can click this item udate button to change this item all date
- Delete
  - In Find page,You can click this item Delete button to Delete






  # Restful
In this project, there are three HTTP request types, post, get and delete.
- Post 
	Post request is used for insert.
	Path URL: /api/item/itemID
	Test: curl -X POST -H "Content-Type: application/json" --data '{"itemName":"ERROR","supplier":"node.js","itemQuantity":"99"}' localhost:8099/api/item/itemID/E404
- Get
	Get request is used for find.
	Path URL: /api/item/itemID/:itemID
    Test: curl -X GET http://localhost:8099/api/item/itemID/A0004

- Delete
	Delete request is used for deletion.
	Path URL: /api/item/itemID/:itemID
	Test: curl -X DELETE localhost:8099/api/item/itemID/A0009




