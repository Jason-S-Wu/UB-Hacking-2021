import PropTypes from 'prop-types'

const Header = ({ title }) => {
    return (
        <header>
            <h1>{title}</h1>
        </header>
    )
}

Header.defaultProps = {
    title: 'UB’s Professors Rating'
}

Header.propTypes = {
    title: PropTypes.string
}

export default Header 