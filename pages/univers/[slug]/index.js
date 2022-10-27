// import from components/Filter
import SideFilterLinks from "../../../components/ecommerce/Filter/SideFilterLinks"
import SideFilter from "../../../components/ecommerce/Filter/SideFilter"
import SideFilterPrice from "../../../components/ecommerce/Filter/SideFilterPrice"
import ShowSelect from "../../../components/ecommerce/Filter/ShowSelect"

// import from components/layout
import Breadcrumb2 from "../../../components/layout/Breadcrumb2"

// import from components/ecommerce
import QuickView from "../../../components/ecommerce/QuickView"
import SingleTypeProduct from "../../../components/ecommerce/SingleProductCopy"
import SingleProduct from "../../../components/ecommerce/SingleProduct"
import Pagination from "../../../components/ecommerce/Pagination"

// import from next
import { useRouter } from "next/router"

// import from react
import { useState, useEffect } from "react"

// import from components/elements
import Description from "../../../components/elements/Description"

// import libraries
import axios from 'axios'

// Compter le nombre de produits pour un filtre x 
const handleCountProductsOfEachFilter = (arr, prop) => {
    const res = []
    for (const element of arr) {
        if(element&&element['attributes']&&element['attributes'][prop]){
            if (res.find(e=>e.item['attributes'][prop]==element['attributes'][prop])) {
                res.find(e=>e.item['attributes'][prop]==element['attributes'][prop]).count += 1
            } else {
                res.push({item:element, count:1})
            }
        }
    }
    return(res) 
}

// Compter le nombre de produits pour le filtre prix
const handleCountProductsOfEachPrice = (arr, prop, prices) => {
    let res = []
    for (let i=0; i<prices.length-1; i++){
        res.push({
            id : prices[i],
            item : [prices[i], prices[i+1]], 
            count : (arr.filter(element=>element['attributes']&&element['attributes'][prop]&&element['attributes'][prop]>prices[i]&&element['attributes'][prop]<prices[i+1])).length
        })
    }
    res = res.filter(e=>e.count>0)
    return(res) 
}

// Trier un tableau de produis selon s'il est client ou pas client
const handleSortByClientOrNotClient = (tab, lib1, lib2) => {
    return tab.sort((a,b) => (a['attributes'][lib1]['data']['attributes'][lib2] > b['attributes'][lib1]['data']['attributes'][lib2]) ? -1 : ((b['attributes'][lib1]['data']['attributes'][lib2] > a['attributes'][lib1]['data']['attributes'][lib2]) ? 1 : 0))
}

const Products = ({ univers, categories, univers_categories_Props, produit_Props, superunivers, categories_Props, produits_univers, filtersInitail }) => {

    const router = useRouter()

    // Nombre Maximum des catégories à afficher
    const [limit, setLimit] = useState(produits_univers.length)

    // Nombre de page de pagination 
    const [pages, setPages]  = useState([])

    // La page actuelle sur laquelle on se trouve
    const [currentPage, setCurrentPage] = useState(1)

    // Controller l'affichage du filtre à gauche qui contient la liste des univers
    const [showUnivers, setShowUnivers] = useState(true)
 
    // Controller l'affichage du filtre à gauche qui contient la liste des catégories   
    const [showCategories, setShowCategories] = useState(true)
       
    // Liste des produits
    const [produitsState, setProduitsState] = useState([])

    // Liste des filtres proposés à la gauche de la page 
    const [marques, setMarques] = useState([])
    const [prices, setPrices] = useState([])
    const [designers, setDesigners] = useState([])
    const [couleurs, setCouleurs] =useState([])
    const [motifs, setMotifs] = useState([])
    const [styles, setStyles] = useState([])    
    const [materiaux, setMateriaux] = useState([])

    // Les filtres actuelles choisi par l'utilisateur 
    const [filterPrice, setFilterPrice] = useState([])
    const [filterCouleur, setFilterCouleur] =useState([])
    const [filterMotif, setFilterMotif] = useState([])
    const [filterStyle, setFilterStyle] = useState([]) 
    const [filterMateriau, setFilterMateriau] = useState([])   
    const [filterDesigner, setFilterDesigner] = useState([])
    const [filterMarque, setFilterMarque] = useState([])

    const handleShowAllDescription = (value) => {
        router.push('#universdescription')
    }

    useEffect(()=>{

        // Mettre à jour l'apparence des filtres à gauche 
        let couleursLocal = [...produit_Props.couleurs]
        couleursLocal.filter(couleur=>filtersInitail.couleur.includes(couleur['item']['id'])?couleur['checked'] = true && couleur:null) 
        setCouleurs([...couleursLocal])

        let motifsLocal = [...produit_Props.motifs]
        motifsLocal.filter(motif=>filtersInitail.motif.includes(motif['item']['id'])?motif['checked'] = true && motif:null)
        setMotifs([...motifsLocal])
        
        let stylesLocal = [...produit_Props.styles]
        stylesLocal.filter(style=>filtersInitail.style.includes(style['item']['id'])?style['checked'] = true && style:null)
        setStyles([...stylesLocal])
        
        let designersLocal = [...produit_Props.designers]
        designersLocal.filter(designer=>filtersInitail.designer.includes(designer['item']['id'])?designer['checked'] = true && designer:null)
        setDesigners([...designersLocal])
       
        let materiauxLocal = [...produit_Props.materiaux]
        materiauxLocal.filter(materiau=>filtersInitail.materiau.includes(materiau['item']['id'])?materiau['checked'] = true && materiau:null)
        setMateriaux([...materiauxLocal])        
       
        let marquesLocal = [...produit_Props.marques]
        marquesLocal.filter(marque=>filtersInitail.marque.includes(marque['item']['id'])?marque['checked'] = true && marque:null)
        setMarques([...marquesLocal])
        
        let pricesLocal = [...produit_Props.prix]
        pricesLocal.filter(price=>filtersInitail.prix[0]==price.item[0] && filtersInitail.prix[1]==price.item[1] ? price['checked'] = true && price:null)
        setPrices([...pricesLocal])

        // Initialiser les filtres 
        setFilterCouleur(filtersInitail.couleur)
        setFilterMotif(filtersInitail.motif)
        setFilterStyle(filtersInitail.style)
        setFilterDesigner(filtersInitail.designer)
        setFilterMarque(filtersInitail.marque)
        setFilterMateriau(filtersInitail.materiau)
        setFilterPrice(filtersInitail.prix)

    },[]) 

    useEffect(()=>{   
        const tab = []
        for (let i=1; i<produitsState.length/limit+1;i++){
            tab.push(i)
        }
        setPages(tab)
    },[limit])

    useEffect(()=>{

        // Initialiser les nouveautées à filtrer
        const produitsFiltered = [...produits_univers]

        // Filtrage des nouveautés 
        if(filterPrice.length>0){
            produitsFiltered=produitsFiltered.filter(produit => parseFloat(produit['attributes']['TARIF_PUB'])>=filterPrice[0] && parseFloat(produit['attributes']['TARIF_PUB'])<=filterPrice[1])
        }
        if(filterCouleur.length>0){
            produitsFiltered=produitsFiltered.filter(produit=>produit['attributes']['couleur']['data']&&filterCouleur.includes(produit['attributes']['couleur']['data']['id']))
        }
        if(filterMotif.length>0){
            produitsFiltered=produitsFiltered.filter(produit=>produit['attributes']['motif']['data']&&filterMotif.includes(produit['attributes']['motif']['data']['id']))
        }
        if(filterStyle.length>0){
            produitsFiltered=produitsFiltered.filter(produit=>produit['attributes']['style']['data']&&filterStyle.includes(produit['attributes']['style']['data']['id']))
        }
        if(filterMateriau.length>0){
            produitsFiltered=produitsFiltered.filter(produit=>produit['attributes']['materiau']['data']&&filterMateriau.includes(produit['attributes']['materiau']['data']['id']))
        }
        if(filterDesigner.length>0){
            produitsFiltered=produitsFiltered.filter(produit=>filterDesigner.includes(produit['id']))
        }  
        if(filterMarque.length>0){
            produitsFiltered=produitsFiltered.filter(produit=>filterMarque.includes(produit['id']))
        }     

        // Mettre à jour de la liste des nouveautés à afficher
        setProduitsState([...produitsFiltered])

        // Mettre à jour le nombre des nouveautés maximum
        setLimit(produitsFiltered.length)    

        // Mettre à jour la pagination
        setCurrentPage(1)    

        // Gestion du routeur 
        if(produitsFiltered.length != produits_univers.length){

            const obj ={...router.query}
            
            obj['prix']=filterPrice
            obj['couleur']=filterCouleur
            obj['motif']=filterMotif
            obj['style']=filterStyle
            obj['materiau']=filterMateriau
            obj['designer']=filterDesigner
            obj['marque']=filterMarque

            router.push(
                {query: {...obj}},
                null, 
                {shallow : true}
            )
        }

    },[filterCouleur, filterMotif, filterStyle, filterDesigner, filterMarque, filterMateriau, filterPrice])

    // Mise à jour des filtres en prenant en compte ceux que l'utilisateur a choisi 
    const handleFilter = (filterKey, value) => {

        if(filterKey=="couleur"){
            setFilterCouleur(value)
        }
        else if(filterKey=="motif"){
            setFilterMotif(value)
        }
        else if(filterKey=="style"){
            setFilterStyle(value)
        }
        else if(filterKey=="designer"){
            setFilterDesigner(value)
        }
        else if(filterKey=="marque"){
            setFilterMarque(value)
        }
        else if(filterKey=="materiau"){
            setFilterMateriau(value)
        }
        else if(filterKey=="prix"){
            setFilterPrice(value)
        }
    }

    // Affichage de la page suivante (Gestion pagination)
    const next = () => {
        setCurrentPage((currentPage )=>currentPage + 1)
    }

    // Affichage de la page précédente (Gestion pagination)
    const prev = () => {
        setCurrentPage((currentPage)=>currentPage - 1)
    }

    // Affichage de la page choisi (Gestion pagination)
    const handleActive = (item) => {
        setCurrentPage(item)
    }

    // Mise à jour du nombre des produits affichés par page
    const selectChange = (e) => {
        setLimit(Number(e.target.value))
        setCurrentPage(1)
    }

    return (
        univers&&
        <>
            <Breadcrumb2 
                title='Univers' 
                elements={[superunivers['attributes']['LIB'], univers['attributes']['LIB']]} 
                description={univers['attributes']['DOSSIER_TEXTE'].split(`\n`)[0]+univers['attributes']['DOSSIER_TEXTE'].split(`\n`)[1]} 
                handleShowAllDescription = {handleShowAllDescription}             
            />
            <section className="mt-50 mb-50">
                <div className="container">
                    <div className="row flex-row">
                        <div className="col-lg-1-5 primary-sidebar sticky-sidebar">
                        {
                            categories_Props.length>0&&   
                            <div className="sidebar-widget widget-category-2 mb-15">
                                <div style={{display:"flex", justifyContent:"space-between"}}>
                                    <h5 className="style-1 mb-10">
                                        Dans l'univers : {univers['attributes']['LIB']}
                                    </h5>
                                    {!showCategories&&<img style={{width:'25px', height:'25px'}} src="/assets/imgs/theme/icons/down-arrow-svgrepo-com.svg"
                                    onClick={()=>setShowCategories(!showCategories)}/>}
                                    {showCategories&&<img style={{width:'25px', height:'25px'}} src="/assets/imgs/theme/icons/up-arrow-svgrepo-com.svg"
                                    onClick={()=>setShowCategories(!showCategories)}/>}
                                </div>
                                {showCategories&&
                                <SideFilterLinks 
                                items={categories_Props} 
                                prop='LIB_FR'
                                filterKey='categorie'
                                handleFilter = {handleFilter}
                                />}
                            </div>
                        }
                        {
                            univers_categories_Props.length>0&&
                            <div className="sidebar-widget widget-category-2 mb-15">
                                <div style={{display:"flex", justifyContent:"space-between"}}>
                                    <h5 className="style-1 mb-10">
                                        A voir aussi dans : {univers['attributes']['superuniversdetail']['data']['attributes']['LIB']}
                                    </h5>
                                    {!showUnivers&&<img style={{width:'25px', height:'25px'}} src="/assets/imgs/theme/icons/down-arrow-svgrepo-com.svg"
                                    onClick={()=>setShowUnivers(!showUnivers)}/>}
                                    {showUnivers&&<img style={{width:'25px', height:'25px'}} src="/assets/imgs/theme/icons/up-arrow-svgrepo-com.svg"
                                    onClick={()=>setShowUnivers(!showUnivers)}/>}
                                </div>
                                {showUnivers&&
                                <SideFilterLinks 
                                items={univers_categories_Props} 
                                prop='LIB'
                                filterKey='univers'
                                handleFilter = {handleFilter}
                                />}
                            </div>
                        }
                        {
                        marques.length>0&&
                            <div className="list-group">
                                <div className="list-group-item mb-10 mt-10">
                                    <label className="fw-900">Marques</label>
                                    <SideFilter 
                                    elements={marques}
                                    filterKey='marque'
                                    handleFilter={handleFilter}
                                    prop='MARQUE'/>
                                </div>
                            </div> 
                        } 
                        {
                            prices.length>0&&
                            <div className="list-group">
                                <div className="list-group-item mb-10 mt-10">
                                    <label className="fw-900">Prix</label>
                                    <SideFilterPrice 
                                    elements={prices}
                                    filterKey='prix'
                                    handleFilter={handleFilter}
                                    prop='TARIF_PUB'/>
                                </div>
                            </div> 
                        } 
                        {
                            designers.length>0&&
                            <div className="list-group">
                                <div className="list-group-item mb-10 mt-10">
                                    <label className="fw-900">Designers</label>
                                    <SideFilter 
                                    elements={designers}
                                    filterKey='designer'
                                    handleFilter={handleFilter}
                                    prop='DESIGNER'/>
                                </div>
                            </div> 
                        }  
                        {
                            styles.length>0&&
                            <div className="list-group">
                                <div className="list-group-item mb-10 mt-10">
                                    <label className="fw-900">Styles</label>
                                    <SideFilter 
                                    elements={styles}
                                    filterKey='style'
                                    handleFilter={handleFilter}
                                    prop='LIB_FR'/>
                                </div>
                            </div> 
                        }  
                        {
                            couleurs.length>0&&
                            <div className="list-group">
                                <div className="list-group-item mb-10 mt-10">
                                    <label className="fw-900">Couleurs</label>
                                    <SideFilter 
                                    elements={couleurs}
                                    filterKey='couleur'
                                    handleFilter={handleFilter}
                                    prop='LIB_FR'/>
                                </div>
                            </div> 
                        }  
                        {
                            motifs.length>0&&
                            <div className="list-group">
                                <div className="list-group-item mb-10 mt-10">
                                    <label className="fw-900">Motifs</label>
                                    <SideFilter 
                                    elements={motifs}
                                    filterKey='motif'
                                    handleFilter={handleFilter}
                                    prop='LIB_FR'/>
                                </div>
                            </div> 
                        }  
                        {
                            materiaux.length>0&&
                            <div className="list-group">
                                <div className="list-group-item mb-10 mt-10">
                                    <label className="fw-900">Materiaux</label>
                                    <SideFilter 
                                    elements={materiaux}
                                    filterKey='materiau'
                                    handleFilter={handleFilter}
                                    prop='LIB_FR'/>
                                </div>
                            </div> 
                        }
                        </div>

                        <div className="col-lg-4-5">
                            <h2>Découvrez toutes les categories de l'univers {univers['attributes']['LIB']}</h2>
                            <br/>
                            <div className="row product-grid-3">
                                {categories.map((item) => (
                                <div
                                    className="col-lg-1-5 col-md-4 col-12 col-sm-6"
                                    key={item["id"]}
                                >
                                    <SingleTypeProduct key={item["id"]} item={item} baseUrl='categories'/>
                                </div>
                                ))}
                                <div className="row product-grid-3">
                                    <Description description={univers['attributes']['DOSSIER_TEXTE']}/>
                                </div>
                            </div>
                            <div className="col-lg-5-5">
                                <br/><br/>
                                {
                                produits_univers.length > 0 &&
                                <h2>Découvrez tous les produits de l'univers {univers['attributes']['LIB']}</h2>
                                }
                                {
                                produits_univers.length == 0 &&
                                <h2 style={{textAlign:'center'}}>Aucun produit trouvé</h2>
                                }
                                <br/>
                                <div className="shop-product-fillter">
                                    <div className="totall-product">
                                        <p>
                                            <strong className="text-brand">
                                                {produitsState.filter(x=> produitsState.indexOf(x) < limit).length}
                                            </strong>
                                            produits trouvés
                                        </p>
                                    </div>
                                    <div className="sort-by-product-area">
                                        <div className="sort-by-cover mr-10">
                                            <ShowSelect
                                                selectChange={selectChange}
                                                showLimit={produitsState.length}
                                                limitValue={limit}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="row product-grid-3">
                                {produitsState
                                .slice(currentPage*limit-limit, currentPage*limit)
                                .filter(x=>produitsState.slice(currentPage*limit-limit, currentPage*limit).indexOf(x) < limit).map((item, i) => (
                                    <div
                                        key={item["id"]}
                                        className="col-lg-1-5 col-md-4 col-12 col-sm-6"
                                    >
                                        <SingleProduct key={item["id"]} item={item} baseUrl='produits'/>
                                    </div>
                                    ))}
                                </div>
                                <br/><br/>
                                <div className="pagination-area mt-15 mb-sm-5 mb-lg-0">
                                    <nav aria-label="Page navigation example">
                                        <Pagination
                                            getPaginationGroup={pages}
                                            currentPage={currentPage}
                                            pages={pages}
                                            next={next}
                                            prev={prev}
                                            handleActive={handleActive}
                                        />
                                    </nav>
                                </div>
                            </div> 
                        </div>                          
                    </div>
                </div>
            </section>
            <QuickView />
        </>
    )
}

export default Products

export async function getServerSideProps (context) {

    // Import qs
    const qs = require('qs')


    //  Variables
    const produit_Props = {marques:[], prix:[], designers:[], styles:[], couleurs:[], motifs:[], materiaux:[]}
    let filters = {marque:[], prix:[], designer:[], style:[], couleur:[], motif:[], materiau:[]} 
    let univers_categories_Props = []
    let categories_Props = []
    let produits_univers = []
    let filteredProduits = []

    // Query univers 
    const query = qs.stringify({
        populate: [
            'superuniversdetail.rayondetails.categories.typeprods.produits',
            'categories.typeprods.produits.style',
            'categories.typeprods.produits.ambiance',
            'categories.typeprods.produits.couleur',
            'categories.typeprods.produits.motif',
            'categories.typeprods.produits.pay',
            'categories.typeprods.produits.materiau',    
            'categories.typeprods.produits.fabrication',
            'categories.typeprods.produits.exposant'   
        ]
      }, {
        encodeValuesOnly: true, // prettify URL
      })
    const universRes = await axios.get(`http://localhost:1337/api/rayondetails/${context.params.slug}?${query}`)

    // Compter le nombre de produits pour chaque univers
    universRes.data.data.attributes.superuniversdetail.data.attributes.rayondetails.data.forEach(univers => {
        let count = 0
        univers.attributes.categories.data.forEach(categorie => {
           categorie.attributes.typeprods.data.forEach(typeprod => {
                count+=typeprod.attributes.produits.data.length
           })
        })
        univers_categories_Props.push({item : univers , count : count})
    })

    // Création des filtres
    universRes.data.data.attributes.categories.data.forEach(categorie => {
        let count = 0
        categorie.attributes.typeprods.data.forEach(typeprod => {
            typeprod.attributes.produits.data.forEach(produit => {
                produit_Props.marques.push(produit)
                produit_Props.prix.push(produit)
                produit_Props.designers.push(produit)
                produit.attributes['style']&&produit_Props.styles.push(produit.attributes['style'].data)
                produit.attributes['couleur']&&produit_Props.couleurs.push(produit.attributes['couleur'].data)
                produit.attributes['motif']&&produit_Props.motifs.push(produit.attributes['motif'].data)
                produit.attributes['materiau']&&produit_Props.materiaux.push(produit.attributes['materiau'].data)

                // Recupérer tous les produits de l'univers
                produits_univers.push(produit)
            })

            // Compter le nombre de produits pour chaque catégorie
            count+=typeprod.attributes.produits.data.length
        })

        categories_Props.push({item : categorie , count : count})
    })

    // Compter le nombre de produits pour chaque filtre 
    produit_Props.marques=handleCountProductsOfEachFilter(produit_Props.marques,'MARQUE')
    produit_Props.prix=handleCountProductsOfEachPrice(produit_Props.prix,'TARIF_PUB', [0,150,350,500,750,1000,2000,1000000])
    produit_Props.designers=handleCountProductsOfEachFilter(produit_Props.designers,'DESIGNER')
    produit_Props.styles=handleCountProductsOfEachFilter(produit_Props.styles,'LIB_FR')
    produit_Props.couleurs=handleCountProductsOfEachFilter(produit_Props.couleurs,'LIB_FR')              
    produit_Props.motifs=handleCountProductsOfEachFilter(produit_Props.motifs,'LIB_FR')
    produit_Props.materiaux=handleCountProductsOfEachFilter(produit_Props.materiaux,'LIB_FR')

    // Recupérer la liste des filtres a partir de l'url 
    if(context.query.marque){
        filters.marque = typeof context.query.marque == 'string' ? [parseInt(context.query.marque)] : context.query.marque.map(element=>parseInt(element))
    }
    if(context.query.designer){
        filters.designer = typeof context.query.designer == 'string' ? [parseInt(context.query.designer)] : context.query.designer.map(element=>parseInt(element))
    }
    if(context.query.prix){
        filters.prix = typeof context.query.prix == 'string' ? [parseInt(context.query.prix)] : context.query.prix.map(element=>parseInt(element))
    }
    if(context.query.style){
        filters.style = typeof context.query.style == 'string' ? [parseInt(context.query.style)] : context.query.style.map(element=>parseInt(element))
    }
    if(context.query.couleur){
        filters.couleur = typeof context.query.couleur == 'string' ? [parseInt(context.query.couleur)] : context.query.couleur.map(element=>parseInt(element))
    }
    if(context.query.motif){
        filters.motif = typeof context.query.motif == 'string' ? [parseInt(context.query.motif)] : context.query.motif.map(element=>parseInt(element))
    }
    if(context.query.materiau){
        filters.materiau = typeof context.query.materiau == 'string' ? [parseInt(context.query.materiau)] : context.query.materiau.map(element=>parseInt(element))
    }

    // Ordonner les produits selon leur Status (client ou pas client)
    filteredProduits= handleSortByClientOrNotClient(produits_univers, 'exposant', 'CLIENT_ABONNEMENT_PAYANT')
    
    return {
        props: {
            univers : universRes.data.data,
            categories : universRes.data.data.attributes.categories.data,
            univers_categories : universRes.data.data.attributes.superuniversdetail.data.attributes.rayondetails.data,
            produit_Props : produit_Props,
            univers_categories_Props : univers_categories_Props,
            superunivers : universRes.data.data.attributes.superuniversdetail.data,
            categories_Props : categories_Props,
            produits_univers : filteredProduits,
            filtersInitail : filters
        }
      }
}
