import '../css/Logo.scss'

export default function Logo() {

    function scrollTop() {
        window.scrollTo(0, 0);
    }

    return <div className="go-next-logo-wrapper" onClick={() => scrollTop()}>
        <h1 className='go-next-logo'>GO</h1>
        <h1 className='go-next-logo'>NEXT!</h1>
    </div>
    
}