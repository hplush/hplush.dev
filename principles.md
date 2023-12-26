# [h+h lab](../) principles

## Protect users from ourselves

For every project, we need to create a **document with all security risks** and how we reduce these risks. This document should cover attacks from:

* **Ourselves.** What if we start to be an evil company? The document should especially cover preventing ourselves from being an uncontrollable monopoly.
* **Government and big companies.** Who has access to user data? How we can prevent data leaks.
* **Trolls.** How can people use community rules in a destructive form?


## Users-first

* **Users own their data.** They should understand if we use their data for anything. Our architecture should allow them to remove their data or download it.
* We should prefer [local-first](https://www.inkandswitch.com/local-first.html) architecture.
* User should be able to **change client** or move to another vendor.
* UI should explain to users **how everything works**. No magic or black boxes.
* **We do not make decisions for users.** We should explain the consequences to them and help them decide. Users should feel that they control the system.


## Support diversity over mainstream

* We should focus on **specific cases** instead of creating a universal system for everything.
* In every app we should care about **i18n**, **cross-platform support**, and **a11y**.
* **There is no single truth.** Freedom is right to be wrong.


## Open by default

* **Monetization model** or plans for it in early stages should be open and documented. The security risks document from “Protect users from ourselves” is a good place for it.
* We should keep **discussions about the project open**. If it is impossible, we should explain the reasons behind our discussions.
* All code should be **open-source by default**. We should have good reasons if we need to close any component.
* We should **document all protocols** used in an application.
* **We are making mistakes.** We should not fear uncomfortable questions and even promote discussions about our problems. On the other hand, we should not blame anyone from the team for mistakes.
