// /api/projects.js
export default async function handler(req, res) {
  const { method } = req;
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (method === 'GET') {
    try {
      // GitHub'dan raw JSON'u oku
      const response = await fetch(
        'https://raw.githubusercontent.com/DYHEZ/Code11/main/database/projects.json'
      );
      
      if (!response.ok) {
        throw new Error('Database okunamadı');
      }
      
      const data = await response.json();
      
      // Cache için header (5 dakika)
      res.setHeader('Cache-Control', 'public, s-maxage=300');
      
      return res.status(200).json({
        success: true,
        data: data.projects,
        meta: {
          total: data.total,
          last_updated: data.last_updated
        }
      });
      
    } catch (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  if (method === 'POST') {
    // Yeni proje ekleme (Token gerektirir)
    try {
      const token = process.env.GITHUB_TOKEN;
      
      if (!token) {
        return res.status(401).json({ 
          success: false, 
          error: 'GitHub Token bulunamadı' 
        });
      }
      
      // Önce mevcut datayı al
      const currentResponse = await fetch(
        'https://api.github.com/repos/KULLANICIADI/REPOADI/contents/database/projects.json',
        {
          headers: {
            'Authorization': `token ${token}`,
            'User-Agent': 'Vercel-Portfolio'
          }
        }
      );
      
      const currentData = await currentResponse.json();
      
      // Base64 decode
      const content = JSON.parse(
        Buffer.from(currentData.content, 'base64').toString()
      );
      
      // Yeni projeyi ekle
      const newProject = {
        id: Date.now(),
        ...req.body,
        created_at: new Date().toISOString().split('T')[0]
      };
      
      content.projects.push(newProject);
      content.total = content.projects.length;
      content.last_updated = new Date().toISOString().split('T')[0];
      
      // GitHub'a yaz
      const updateResponse = await fetch(
        'https://api.github.com/repos/KULLANICIADI/REPOADI/contents/database/projects.json',
        {
          method: 'PUT',
          headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json',
            'User-Agent': 'Vercel-Portfolio'
          },
          body: JSON.stringify({
            message: `Add new project: ${newProject.title}`,
            content: Buffer.from(JSON.stringify(content, null, 2)).toString('base64'),
            sha: currentData.sha
          })
        }
      );
      
      const result = await updateResponse.json();
      
      return res.status(200).json({
        success: true,
        message: 'Proje eklendi!',
        data: newProject,
        github_response: result
      });
      
    } catch (error) {
      console.error('POST error:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  return res.status(405).json({ 
    success: false, 
    error: 'Method not allowed' 
  });
  }
