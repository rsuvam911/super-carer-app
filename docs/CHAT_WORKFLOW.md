# Below document is a reference for inplementing chat workflow in super-care-app

1. There is a general available chat page which will call api endpoint to fetch all chat room list

2. Beside there is a chat window which has conversations between current user and expected user

3. When signed in user clicks on a chat room from list the conversations will open between user and expected user on chat window

4. Users are defined as either client of care provider. Client can directly start conversation with provider but provider can not unless they have previous conversation.

5. Client can start conversation with a provider from the provider's detail page or from past chat room.

6. Providers can communicate with client only from previous chat room. or from the booking details page for the booked client.

7. When client or provider directly starts conversation with provider or vice versa, it will create new chat room and add both users into them instead of manually creating one.

8. Chat rooms are created when any user sends message first time.

9. If a user deletes their account then all related chats will be deleted too.
