import { FaFacebook, FaInstagram, FaTwitter, FaMapMarker } from 'react-icons/fa';

export default function FixedSocials() {
  return (
    <div className='wp-fixed-socials'>
        <div className='flex justify-center flex-col align-items-center gap-10'>
          {/* <a
            href='#'
            target='_blank'
            rel='noreferrer'
          >
            <FaTwitter />
          </a> */}
          <a
            href='https://www.facebook.com/profile.php?id=61554648693457'
            target='_blank'
            rel='noreferrer'
          >
            <FaFacebook />
          </a>
          <a
            href='https://www.instagram.com/superpet.delivery/'
            target='_blank'
            rel='noreferrer'
          >
            <FaInstagram />
          </a>
          <a
            href='https://www.google.com/maps/place/Super+Pet+Delivery/@-27.6316157,-48.6558265,15z/data=!4m6!3m5!1s0x95273597c288c591:0x428507ff8e06abda!8m2!3d-27.6316157!4d-48.6558265!16s%2Fg%2F11tx4q5rtv?entry=ttu'
            target='_blank'
            rel='noreferrer'
          >
            <FaMapMarker />
          </a>
        </div>
    </div>
  );
}