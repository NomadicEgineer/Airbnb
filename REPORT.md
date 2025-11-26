Project report — Models, Controllers, Return Types, and Feature Logic

**Overview**
- This report describes model schemas in `model/`, how controllers use those models, what Mongoose functions return (object vs array), and the core logic for features (add/edit/delete homes, favourites, bookings, listing, detail page).

**Files used**
- `model/homeModel.js`
- `model/favourites.js`
- `controller/homes.js`
- `controller/store.js`
- `routes/hostRouter.js`

**1) Model Schemas**

- `homeModel.js` — Home schema
  - Fields:
    - `housename` (String, required)
    - `price` (Number, required)
    - `location` (String, required)
    - `photourl` (String, optional)
    - `description` (String, optional)
  - Export: `module.exports = Home` (exports the Model object itself)

- `favourites.js` — Favourite schema
  - Fields:
    - `homeId` (ObjectId, ref: 'Home', required)
  - Export: `exports.Favourite = moongoose.model('Favourite', favourite)`
  - Note: the file uses the identifier `moongoose` (typo) instead of `mongoose`. That still works *if* the identifier is used consistently; best practice is to name it `mongoose`.

**2) How controllers use models (patterns & important notes)**

- Typical Mongoose calls used in this codebase:
  - `Home.find()`
    - Returns a Query that resolves to an array of documents (Array of Home objects).
    - Used to fetch all homes for listing pages.
  - `Home.findById(id)`
    - Returns a Query that resolves to a single document (Home object) or `null` if not found.
    - NOT an array — do not index into it (do not use `[0]`).
  - `new Home({...})` followed by `.save()`
    - Creates a new document instance and saves it. Resolves to the saved document object.
  - `Model.findOne({ ... })`
    - Resolves to a single document or `null`.
  - `Model.findOneAndDelete(...)` / `Model.findByIdAndDelete(id)`
    - Resolves to the deleted document or `null`.

- Important mismatches / bugs to watch for in the current controllers:
  - `controller/homes.js` imports the model as `const {Home} = require('../model/homeModel')` but `homeModel.js` does `module.exports = Home` (the model is exported directly). Destructuring expects an object with a `Home` property and yields `undefined`. This causes `TypeError: Home is not a constructor` when `new Home()` is called. Fixes:
    - Change controller import to `const Home = require('../model/homeModel')`
    - OR change model export to `module.exports = { Home }`.
  - `Home.findById(id)` results are treated like arrays in `controller/homes.js` (code uses `arrHome[0]`). This is incorrect — `findById` returns a single document. Use the returned doc directly (`home`) or use `find()` if expecting an array.
  - Updating: `postEditHome` creates a `new Home(...)` with positional args — not how the Mongoose model constructor is normally used. For updating existing documents prefer `Home.findByIdAndUpdate(id, update, {new: true})` or find the document, mutate fields and call `save()`.
  - Deleting: `Home.delete(req.params.homeId)` is not a Mongoose method. Use `Home.findByIdAndDelete(id)` or `Home.deleteOne({ _id: id })`.

**3) Controller functions (summary, behavior, and return types)**

- controller/homes.js
  - `getHostHomeList(req, res, next)`
    - Calls `Home.find()` -> resolves to `Array<Home>`.
    - Renders `host/host-home-list` with `{ registeredHomes: arrHome }` where `arrHome` is an array.
  - `getAddHome(req, res, next)`
    - Renders the add form. No model queries.
  - `postAddHome(req, res, next)`
    - Creates `new Home({...})` then `.save()` -> resolves to saved Home object.
    - Redirects to `/host/home-list`.
  - `getEditHome(req, res, next)`
    - Calls `Home.findById(id)` -> single Home or `null`.
    - Current code expects array and uses `arrHome[0]` — should use the returned doc directly.
    - Renders `host/edit-home` with `home` (object) and `editing` flag.
  - `postEditHome(req, res, next)`
    - Current code incorrectly constructs `new Home(...)` to update; should use `findByIdAndUpdate` or load, modify, save.
  - `postDeleteHome(req, res, next)`
    - Current code calls `Home.delete(...)` — should use `findByIdAndDelete` or `deleteOne`.

- controller/store.js
  - `getHomeDetail(req, res, next)`
    - Uses `Home.findById(homeId)` -> resolves to single Home object.
    - Renders `store/home-detail` with the Home object.
  - `getHomes(req, res, next)`
    - Uses `Home.find()` -> resolves to array of homes -> renders list.
  - `getBookings` (old style `Favourite.getFavourites(...)`)
    - This suggests an older custom API in `favourites` was expected. Current `favourites.js` exports `Favourite` model; there is no `getFavourites` helper. If the code expects `Favourite.getFavourites`, add that helper or update controller to use `Favourite.find()`.
  - `getFavourites(req, res)`
    - Calls `Favourite.find()` -> array of Favourite documents (each has `homeId`).
    - Maps to `favouriteIds` (array of strings) and then `Home.find()` for all homes -> then filters `registeredHomes` to those whose `_id` is in `favouriteIds`. The result `favouriteHomes` is an array of Home objects which is passed to the view.
    - Return types: `favourites` is `Array<Favourite>`; `registeredHomes` is `Array<Home>`; `favouriteHomes` is `Array<Home>`.
  - `postFavourites(req, res)`
    - Checks `Favourite.findOne({ homeId })` -> resolves to single doc or `null`.
    - If not existing, `new Favourite({ homeId }).save()` -> resolves to saved Favourite doc.
  - `postDelFav(req, res)`
    - Uses `Favourite.findOneAndDelete({ homeId })` -> resolves to deleted document or `null`.

**4) Return type quick reference (Mongoose)**
- `Model.find()` -> Promise -> resolves to Array of documents (Array<Object>)
- `Model.findById(id)` -> Promise -> resolves to single document or `null` (Object)
- `Model.findOne(query)` -> Promise -> resolves to single document or `null` (Object)
- `new Model(data).save()` -> Promise -> resolves to saved document (Object)
- `Model.findByIdAndUpdate(id, update, {new: true})` -> Promise -> resolves to updated document (Object)
- `Model.findOneAndDelete(...)` -> Promise -> resolves to deleted document (Object) or `null`

**5) Feature logic (short flow for each major feature)**

- Add Home (host)
  - Form submits to `postAddHome`.
  - Controller creates new `Home` instance with fields from `req.body` and `.save()` to the DB.
  - After save, redirect to host home list.

- Edit Home (host)
  - `getEditHome` fetches the Home by id using `findById` and renders the edit form with the document data.
  - `postEditHome` should accept updated fields and either:
    - use `Home.findByIdAndUpdate(id, updatedFields, {new: true})`, or
    - `Home.findById(id)` -> mutate fields -> `.save()`.
  - Redirect to home-list.

- Delete Home (host)
  - `postDeleteHome` should call `Home.findByIdAndDelete(id)` or `Home.deleteOne({ _id: id })` then redirect.

- List & Detail (store)
  - `getHomes` fetches all homes (`Home.find()`) and renders the listing view.
  - `getHomeDetail` uses `findById` to fetch a single Home and renders the detail view.

- Favourites
  - `postFavourites` checks if a Favourite document for a `homeId` exists via `findOne`.
  - If not, it creates and saves a `Favourite` document ({ homeId }).
  - `getFavourites` fetches all Favourite docs, extracts `homeId`s, then fetches all homes and filters to match favourites (this can be optimized by using `Home.find({ _id: { $in: favouriteIds } })`).
  - `postDelFav` deletes the Favourite doc for a `homeId`.

**6) Recommended quick fixes (minimal changes to make controllers work)

- In `controller/homes.js` replace the import line:
  - From: `const {Home}= require('../model/homeModel')`
  - To: `const Home = require('../model/homeModel')`

- In `controller/homes.js` `getEditHome` use the doc directly (no `[0]`):
  - `Home.findById(id).then(home => { if (home) { res.render(..., { home, ... }) }})`

- In `postEditHome` replace the `new Home(...)` update pattern with either `findByIdAndUpdate` or load+save.

- In `postDeleteHome` replace `Home.delete(...)` with `Home.findByIdAndDelete(id)`.

- In `controller/store.js` replace `const {Home} = require('../model/homeModel')` by `const Home = require('../model/homeModel')` and similarly ensure `Favourite` import matches how it's exported.

- Optional optimization in `getFavourites`: instead of loading all homes and filtering, use:
  - `Home.find({ _id: { $in: favouriteIds } })` which returns an array of Home objects.

**7) How to generate PDF of this report**

- I created `REPORT.md` in the project root: `e:\NODE JS BACKEND\lecture-17_Mongoose\REPORT.md`.

- If you have `pandoc` installed, run (PowerShell):

```powershell
pandoc .\REPORT.md -o .\REPORT.pdf
```

- If you prefer using `npm` tools, you can install a Markdown-to-PDF tool globally or locally, e.g. `npm i -g markdown-pdf` and run:

```powershell
markdown-pdf .\REPORT.md -o .\REPORT.pdf
```

- Or open `REPORT.md` in VS Code and use the Print / Save as PDF option.

**Notes & next steps**
- I flagged specific code issues (model import mismatch, using array indexing on `findById`, wrong delete/update calls). I can apply the minimal code fixes automatically if you want (patch `controller/homes.js` and `controller/store.js`).
- I can also convert `REPORT.md` to `REPORT.pdf` here if you have `pandoc` available in this environment — tell me if you want me to attempt conversion now.

---

End of report.
